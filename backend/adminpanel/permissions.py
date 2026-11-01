from rest_framework.permissions import BasePermission
from authentication.permissions import RoleChoices

class IsAdminUser(BasePermission):
    message = 'Admin access required.'

    def has_permission(self, request, view):
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        return (
            request.user.is_authenticated
            and role_name == 'admin'
        )

class IsModeratorOrAdmin(BasePermission):
    message = 'Moderator or Admin access required.'

    def has_permission(self, request, view):
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        return (
            request.user.is_authenticated
            and role_name in ['admin', 'moderator']
        )

class HasAdminPanelPermission(BasePermission):
    """
    Generic permission to check custom Permission model assignments.
    Can be extended to check authentication.Permission objects linked to roles.
    """
    required_permission_code = None

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name == 'admin':
            return True
        # Placeholder for granular permission check via Role <-> Permission models
        return False
