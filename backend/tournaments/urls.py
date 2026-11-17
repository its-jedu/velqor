from django.urls import path
from .views import (
    PlayerTournamentListView,
    PlayerTournamentRegisterView,
)

# Player-facing URLs (included under /api/v1/ in main urls.py)
urlpatterns = [
    path('tournaments/', PlayerTournamentListView.as_view(), name='player-tournament-list'),
    path('tournaments/<uuid:tournament_pk>/join/', PlayerTournamentRegisterView.as_view(), name='player-tournament-join'),
]
