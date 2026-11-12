from django.urls import path
from .views import (
    AdminDashboardView,
    AnalyticsView,
    UserListCreateView,
    UserDetailView,
    RoleListCreateView,
    RoleDetailView,
    PermissionListCreateView,
    PermissionDetailView,
    GameListCreateView,
    GameDetailView,
    TournamentListCreateView,
    TournamentDetailView,
    TournamentRegistrationListCreateView,
    TournamentRegistrationDetailView,
    MatchListCreateView,
    MatchDetailView,
)

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('analytics/', AnalyticsView.as_view(), name='admin-analytics'),

    # Users / Roles / Permissions
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<uuid:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleDetailView.as_view(), name='role-detail'),
    path('permissions/', PermissionListCreateView.as_view(), name='permission-list-create'),
    path('permissions/<int:pk>/', PermissionDetailView.as_view(), name='permission-detail'),

    # Games
    path('games/', GameListCreateView.as_view(), name='game-list-create'),
    path('games/<int:pk>/', GameDetailView.as_view(), name='game-detail'),

    # Tournaments
    path('tournaments/', TournamentListCreateView.as_view(), name='tournament-list-create'),
    path('tournaments/<uuid:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),

    # Tournament Registrations (join/leave)
    path('tournaments/<uuid:tournament_pk>/register/', TournamentRegistrationListCreateView.as_view(), name='tournament-register'),
    path('registrations/<uuid:pk>/', TournamentRegistrationDetailView.as_view(), name='tournament-registration-detail'),

    # Matches
    path('matches/', MatchListCreateView.as_view(), name='match-list-create'),
    path('matches/<uuid:pk>/', MatchDetailView.as_view(), name='match-detail'),
]
