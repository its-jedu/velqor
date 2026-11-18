from django.urls import path
from .views import (
    PlayerTournamentListView,
    PlayerTournamentRegisterView,
    PlayerTournamentStandingsView,
    PlayerMatchResultSubmitView,
    PlayerMatchResultListView,
)

# Player-facing URLs (included under /api/v1/ in main urls.py)
urlpatterns = [
    path('tournaments/', PlayerTournamentListView.as_view(), name='player-tournament-list'),
    path('tournaments/<uuid:tournament_pk>/join/', PlayerTournamentRegisterView.as_view(), name='player-tournament-join'),
    path('tournaments/<uuid:tournament_pk>/standings/', PlayerTournamentStandingsView.as_view(), name='player-tournament-standings'),
    path('matches/<uuid:match_pk>/submit-result/', PlayerMatchResultSubmitView.as_view(), name='player-match-submit-result'),
    path('matches/<uuid:match_pk>/results/', PlayerMatchResultListView.as_view(), name='player-match-results'),
]
