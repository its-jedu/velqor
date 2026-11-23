from rest_framework.permissions import BasePermission
from authentication.models import Permission


class HasPermission(BasePermission):
    """
    Generic permission that checks if the user's role has a specific permission code.
    
    Usage:
        permission_classes = [HasPermission('manage_tournaments')]
    
    Superusers and users with the 'superadmin' or 'admin' role bypass all checks.
    """
    required_permission_code = None

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Superuser bypasses all checks
        if request.user.is_superuser:
            return True

        # Determine the permission code to check
        code = self.required_permission_code
        if code is None:
            # Allow subclass to define via attribute or view attribute
            code = getattr(view, 'required_permission_code', None)

        if not code:
            return False

        # Superadmin and admin roles have all permissions
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name in ('superadmin', 'admin'):
            return True

        # Granular check via Role <-> Permission M2M
        if role:
            return role.permissions.filter(code=code).exists()

        return False


class IsAdminUser(HasPermission):
    """
    Admin (superadmin/admin role) access required.
    Maintains backward compatibility with existing views.
    """
    message = 'Admin access required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        return role_name in ('superadmin', 'admin')


class IsModeratorOrAdmin(BasePermission):
    """
    Moderator or Admin access required.
    """
    message = 'Moderator or Admin access required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        return role_name in ('superadmin', 'admin', 'moderator')


class HasAdminPanelPermission(HasPermission):
    """
    Generic permission to check custom Permission model assignments.
    Superadmin and admin roles bypass all checks.
    """
    message = 'You do not have permission to access this resource.'

    def has_permission(self, request, view):
        # Superuser bypasses
        if request.user and request.user.is_authenticated and request.user.is_superuser:
            return True

        # Admin/superadmin role bypasses
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name in ('superadmin', 'admin'):
            return True

        # Granular permission check
        code = self.required_permission_code or getattr(view, 'required_permission_code', None)
        if not code:
            return False

        if role:
            return role.permissions.filter(code=code).exists()

        return False


class IsOwnerOrAdmin(BasePermission):
    message = 'You do not have permission to access this object.'

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name in ('superadmin', 'admin'):
            return True
        return obj == request.user


def perm(code):
    """Factory: returns a HasPermission class with the given code set.
    
    Usage in views:
        permission_classes = [IsAuthenticated, perm('manage_tournaments')]
    
    DRF instantiates permission classes automatically, so we return the class
    itself, not an instance.
    """
    class _Perm(HasPermission):
        required_permission_code = code
    return _Perm
