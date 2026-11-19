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
    TournamentListCreateView,
    TournamentDetailView,
    TournamentStatusChangeView,
    MatchListCreateView,
    MatchDetailView,
    TournamentStandingsView,
)
from tournaments.views import AdminPendingResultsView, AdminVerifyResultView

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

    # Tournaments
    path('tournaments/', TournamentListCreateView.as_view(), name='tournament-list-create'),
    path('tournaments/<uuid:pk>/', TournamentDetailView.as_view(), name='tournament-detail'),
    path('tournaments/<uuid:pk>/status/', TournamentStatusChangeView.as_view(), name='tournament-status-change'),

    # Matches (admin only)
    path('matches/', MatchListCreateView.as_view(), name='match-list-create'),
    path('matches/<uuid:pk>/', MatchDetailView.as_view(), name='match-detail'),
    path('matches/pending-results/', AdminPendingResultsView.as_view(), name='admin-pending-results'),
    path('matches/<uuid:match_pk>/verify/', AdminVerifyResultView.as_view(), name='admin-verify-result'),

    # Standings (admin only)
    path('standings/', TournamentStandingsView.as_view(), name='tournament-standings'),
]
