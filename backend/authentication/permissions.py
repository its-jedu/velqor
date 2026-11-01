from rest_framework.permissions import BasePermission

class RoleChoices:
    PLAYER = 'player'
    ADMIN = 'admin'
    MODERATOR = 'moderator'

    CHOICES = [
        (PLAYER, 'Player'),
        (ADMIN, 'Admin'),
        (MODERATOR, 'Moderator'),
    ]

class IsAuthenticatedPlayer(BasePermission):
    message = 'Player role required.'

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, 'role', None)
        role_name = role.name if role else None
        return (
            user.is_authenticated
            and role_name == 'player'
        )

class IsAdmin(BasePermission):
    message = 'Admin role required.'

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, 'role', None)
        role_name = role.name if role else None
        return (
            user.is_authenticated
            and role_name == 'admin'
        )

class IsModeratorOrAdmin(BasePermission):
    message = 'Moderator or Admin role required.'

    def has_permission(self, request, view):
        user = request.user
        role = getattr(user, 'role', None)
        role_name = role.name if role else None
        return (
            user.is_authenticated
            and role_name in ['admin', 'moderator']
        )

class IsOwnerOrAdmin(BasePermission):
    message = 'You do not have permission to access this object.'

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name == 'admin':
            return True
        return obj == request.user
