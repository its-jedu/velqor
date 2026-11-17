from rest_framework.permissions import BasePermission


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
