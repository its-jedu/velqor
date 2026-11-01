from django.urls import path
from .views import (
    AdminDashboardView,
    UserListCreateView,
    UserDetailView,
    RoleListCreateView,
    RoleDetailView,
    PermissionListCreateView,
    PermissionDetailView,
)

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    path('permissions/', PermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', PermissionDetailView.as_view(), name='permission-detail'),
]
