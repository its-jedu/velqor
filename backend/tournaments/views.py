from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser, IsModeratorOrAdmin
from .serializers import (
    GameSerializer, TournamentSerializer, TournamentRegistrationSerializer,
    MatchSerializer, TournamentStandingSerializer,
)
from .models import (
    Game, Tournament, TournamentRegistration, Match, TournamentStanding,
)
from authentication.models import User
from authentication.permissions import RoleChoices
from django.conf import settings
from django.db.models import Count, Sum, Q, F
from django.db.models.functions import TruncDate
from datetime import timedelta
from django.utils import timezone
import resend
import itertools


# ============================================================================
# GAME CRUD
# ============================================================================

class GameListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        games = Game.objects.all().order_by('name')
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game = serializer.save()
        return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)


class GameDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return Game.objects.get(pk=pk)
        except Game.DoesNotExist:
            return None

    def get(self, request, pk):
        game = self.get_object(pk)
        if not game:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(GameSerializer(game).data)

    def patch(self, request, pk):
        game = self.get_object(pk)
        if not game:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = GameSerializer(game, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        game = serializer.save()
        return Response(GameSerializer(game).data)

    def delete(self, request, pk):
        game = self.get_object(pk)
        if not game:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if game.tournaments.exists():
            return Response(
                {'message': 'Cannot delete game: tournaments reference it.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        game.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# TOURNAMENT CRUD
# ============================================================================

class TournamentListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tournaments = Tournament.objects.select_related('game', 'created_by').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            tournaments = tournaments.filter(status=status_filter)
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request):
        cover_image_file = request.FILES.get('cover_image')
        cover_image_url = None

        if cover_image_file:
            try:
                cover_image_url = upload_image_to_r2(cover_image_file)
            except Exception as e:
                return Response({'message': f'Image upload failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        if cover_image_url:
            data['cover_image'] = cover_image_url

        serializer = TournamentSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            tournament = serializer.save()
        except Exception as e:
            return Response({'message': f'Tournament creation failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(TournamentSerializer(tournament).data, status=status.HTTP_201_CREATED)


class TournamentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return Tournament.objects.select_related('game', 'created_by').get(pk=pk)
        except Tournament.DoesNotExist:
            return None

    def get(self, request, pk):
        tournament = self.get_object(pk)
        if not tournament:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TournamentSerializer(tournament).data)

    def patch(self, request, pk):
        tournament = self.get_object(pk)
        if not tournament:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        cover_image_file = request.FILES.get('cover_image')
        cover_image_url = None

        if cover_image_file:
            try:
                cover_image_url = upload_image_to_r2(cover_image_file)
            except Exception as e:
                return Response({'message': f'Image upload failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        if cover_image_url:
            data['cover_image'] = cover_image_url

        serializer = TournamentSerializer(tournament, data=data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            tournament = serializer.save()
        except Exception as e:
            return Response({'message': f'Tournament update failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(TournamentSerializer(tournament).data)

    def delete(self, request, pk):
        tournament = self.get_object(pk)
        if not tournament:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        if tournament.registrations.exists():
            return Response(
                {'message': 'Cannot delete tournament: players have registered.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        tournament.delete()
        return Response({'message': 'Tournament deleted successfully.'}, status=status.HTTP_200_OK)


class TournamentStatusChangeView(APIView):
    """
    PATCH - Change tournament status (admin only)
    Body: { "status": "open" | "full" | "started" | "completed" | "draft" }
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            tournament = Tournament.objects.get(pk=pk)
        except Tournament.DoesNotExist:
            return Response({'message': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = ['draft', 'open', 'full', 'started', 'completed']
        if new_status not in valid_statuses:
            return Response({
                'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate status transitions
        current_status = tournament.status
        if current_status == 'completed':
            return Response({'message': 'Cannot change status of a completed tournament.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_status == 'draft' and new_status not in ('open', 'draft'):
            return Response({'message': 'Draft tournaments can only be opened or kept as draft.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_status == 'open' and new_status not in ('open', 'full', 'started', 'draft'):
            return Response({'message': 'Open tournaments can only be set to open, full, started, or draft.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_status == 'full' and new_status not in ('full', 'started', 'open'):
            return Response({'message': 'Full tournaments can only be set to full, started, or open.'}, status=status.HTTP_400_BAD_REQUEST)

        if current_status == 'started' and new_status not in ('started', 'completed', 'open'):
            return Response({'message': 'Started tournaments can only be set to started, completed, or open.'}, status=status.HTTP_400_BAD_REQUEST)

        tournament.status = new_status
        tournament.save()

        # Auto-generate standings and matches when tournament becomes full
        if new_status == 'full' and current_status != 'full':
            _generate_standings_and_matches(tournament)

        # Notify players via background task
        if new_status == 'full':
            async_task(notify_tournament_full, tournament.id)

        return Response({
            'message': f'Tournament status changed from {current_status} to {new_status}.',
            'status': tournament.status
        }, status=status.HTTP_200_OK)


# ============================================================================
# MATCH GENERATION HELPERS
# ============================================================================

def _generate_standings_and_matches(tournament):
    """Auto-generate standings and match schedules when tournament becomes full."""
    registrations = TournamentRegistration.objects.filter(
        tournament=tournament
    ).select_related('user').order_by('joined_at')

    players = [reg.user for reg in registrations]

    # Create standings for all players
    for player in players:
        TournamentStanding.objects.get_or_create(
            tournament=tournament, user=player
        )

    # Generate matches based on tournament format
    if tournament.tournament_type == 'league':
        _generate_league_matches(tournament, players)
    elif tournament.tournament_type == 'cup':
        if tournament.cup_type == 'group_stage':
            _generate_group_stage_matches(tournament, players)
        else:
            _generate_knockout_matches(tournament, players)


def _generate_league_matches(tournament, players):
    """Round-robin: every player plays every other player."""
    player_list = list(players)
    for i in range(len(player_list)):
        for j in range(i + 1, len(player_list)):
            Match.objects.create(
                tournament=tournament,
                player_one=player_list[i],
                player_two=player_list[j],
                status='pending',
            )


def _generate_knockout_matches(tournament, players):
    """Single-elimination bracket."""
    player_list = list(players)
    n = len(player_list)

    # Find next power of 2 for bracket
    bracket_size = 1
    while bracket_size < n:
        bracket_size *= 2

    # Add byes for missing players
    players_with_byes = list(player_list) + [None] * (bracket_size - n)

    # First round matches
    for i in range(0, bracket_size, 2):
        p1 = players_with_byes[i]
        p2 = players_with_byes[i + 1]
        if p1 and p2:
            Match.objects.create(
                tournament=tournament,
                player_one=p1,
                player_two=p2,
                status='pending',
            )
        elif p1 and not p2:
            # Bye - p1 advances automatically
            Match.objects.create(
                tournament=tournament,
                player_one=p1,
                player_two=None,
                status='completed',
                winner=p1,
            )


def _generate_group_stage_matches(tournament, players):
    """Group stage: groups of 4, round-robin within groups."""
    player_list = list(players)
    n = len(player_list)

    # Calculate number of groups (aim for 4 players per group)
    num_groups = max(1, (n + 3) // 4)
    players_per_group = (n + num_groups - 1) // num_groups

    # Distribute players into groups
    groups = []
    for i in range(num_groups):
        start = i * players_per_group
        end = min(start + players_per_group, n)
        groups.append(player_list[start:end])

    # Round-robin within each group
    for group in groups:
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                Match.objects.create(
                    tournament=tournament,
                    player_one=group[i],
                    player_two=group[j],
                    status='pending',
                )


def _generate_group_stage_knockout(tournament):
    """Generate knockout matches from group stage top players."""
    standings = TournamentStanding.objects.filter(
        tournament=tournament
    ).order_by('-points', '-won')[:4]

    if len(standings) < 2:
        return

    # Semi-finals: 1st vs 4th, 2nd vs 3rd
    Match.objects.create(
        tournament=tournament,
        player_one=standings[0].user,
        player_two=standings[3].user,
        status='pending',
    )
    Match.objects.create(
        tournament=tournament,
        player_one=standings[1].user,
        player_two=standings[2].user,
        status='pending',
    )

    # Third place match (if allowed)
    if tournament.allows_third_place:
        Match.objects.create(
            tournament=tournament,
            player_one=None,
            player_two=None,
            status='pending',
        )


def _update_match_results(match):
    """Update player standings and tournament status when a match is completed."""
    tournament = match.tournament
    player_one = match.player_one
    player_two = match.player_two
    winner = match.winner

    # Get or create standings for both players
    standing_one, _ = TournamentStanding.objects.get_or_create(
        tournament=tournament, user=player_one
    )
    standing_two, _ = TournamentStanding.objects.get_or_create(
        tournament=tournament, user=player_two
    )

    # League points: win=3, draw=1, loss=0
    if tournament.tournament_type == 'league':
        standing_one.played += 1
        standing_two.played += 1

        if winner is None:
            # Draw
            standing_one.drawn += 1
            standing_two.drawn += 1
            standing_one.points += 1
            standing_two.points += 1
        elif winner == player_one:
            standing_one.won += 1
            standing_one.points += 3
            standing_two.lost += 1
        elif winner == player_two:
            standing_two.won += 1
            standing_two.points += 3
            standing_one.lost += 1

        standing_one.save()
        standing_two.save()

    # Auto-transition tournament status
    if tournament.status == 'full' or tournament.status == 'open':
        # Check if all matches are completed
        total_matches = Match.objects.filter(tournament=tournament).count()
        completed_matches = Match.objects.filter(tournament=tournament, status='completed').count()
        if total_matches > 0 and completed_matches >= total_matches:
            # For cup group stage, generate knockout matches before completing
            if tournament.tournament_type == 'cup' and tournament.cup_type == 'group_stage':
                _generate_group_stage_knockout(tournament)
            else:
                Tournament.objects.filter(pk=tournament.pk).update(status='completed')


# ============================================================================
# TOURNAMENT REGISTRATION (players joining)
# ============================================================================

class TournamentRegistrationListCreateView(APIView):
    """
    GET  - admin: list all registrations
    POST - player: join a tournament (authenticated)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only admins can list all registrations
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name != 'admin':
            return Response({'message': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

        tournament_id = request.query_params.get('tournament')
        registrations = TournamentRegistration.objects.select_related('tournament', 'user').order_by('-joined_at')
        if tournament_id:
            registrations = registrations.filter(tournament_id=tournament_id)
        serializer = TournamentRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TournamentRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tournament = serializer.validated_data['tournament']
        user = request.user

        # Prevent double registration
        if TournamentRegistration.objects.filter(tournament=tournament, user=user).exists():
            return Response({'message': 'Already registered for this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check tournament is open for registration
        if tournament.status not in ('draft', 'open'):
            return Response({'message': 'Tournament is not open for registration.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check private join code if applicable
        if tournament.join_type == 'private':
            join_code = request.data.get('join_code')
            if not join_code or join_code != tournament.join_code:
                return Response({'message': 'Invalid or missing join code.'}, status=status.HTTP_403_FORBIDDEN)

        # Check capacity
        if tournament.current_players >= tournament.max_players:
            return Response({'message': 'Tournament is full.'}, status=status.HTTP_400_BAD_REQUEST)

        registration = serializer.save(user=user)
        # Increment current_players
        Tournament.objects.filter(pk=tournament.pk).update(current_players=F('current_players') + 1)
        tournament.refresh_from_db()

        # Auto-transition status
        if tournament.current_players >= tournament.max_players and tournament.status == 'open':
            tournament.status = 'full'
            tournament.save()
            _generate_standings_and_matches(tournament)
            # Notify players
            async_task(notify_tournament_full, tournament.id)

        return Response(TournamentRegistrationSerializer(registration).data, status=status.HTTP_201_CREATED)


class TournamentRegistrationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return TournamentRegistration.objects.select_related('tournament', 'user').get(pk=pk)
        except TournamentRegistration.DoesNotExist:
            return None

    def get(self, request, pk):
        reg = self.get_object(pk)
        if not reg:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name != 'admin' and reg.user != request.user:
            return Response({'message': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(TournamentRegistrationSerializer(reg).data)

    def delete(self, request, pk):
        reg = self.get_object(pk)
        if not reg:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        role = getattr(request.user, 'role', None)
        role_name = role.name if role else None
        if role_name != 'admin' and reg.user != request.user:
            return Response({'message': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        # Decrement current_players
        Tournament.objects.filter(pk=reg.tournament.pk).update(current_players=F('current_players') - 1)
        reg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# MATCH CRUD
# ============================================================================

class MatchListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        tournament_id = request.query_params.get('tournament')
        matches = Match.objects.select_related('tournament', 'player_one', 'player_two', 'winner').order_by('-created_at')
        if tournament_id:
            matches = matches.filter(tournament_id=tournament_id)
        serializer = MatchSerializer(matches, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        match = serializer.save()
        return Response(MatchSerializer(match).data, status=status.HTTP_201_CREATED)


class MatchDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return Match.objects.select_related('tournament', 'player_one', 'player_two', 'winner').get(pk=pk)
        except Match.DoesNotExist:
            return None

    def get(self, request, pk):
        match = self.get_object(pk)
        if not match:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(MatchSerializer(match).data)

    def patch(self, request, pk):
        match = self.get_object(pk)
        if not match:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MatchSerializer(match, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_status = match.status
        match = serializer.save()

        # If match just became completed, update league standings and tournament status
        if old_status != 'completed' and match.status == 'completed':
            _update_match_results(match)

        return Response(MatchSerializer(match).data)

    def delete(self, request, pk):
        match = self.get_object(pk)
        if not match:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TournamentStandingsView(APIView):
    """
    GET - List standings for a tournament (?tournament=<id>)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tournament_id = request.query_params.get('tournament')
        if not tournament_id:
            return Response({'message': 'tournament query parameter required.'}, status=status.HTTP_400_BAD_REQUEST)

        standings = TournamentStanding.objects.filter(
            tournament_id=tournament_id
        ).select_related('user').order_by('-points', '-won')
        serializer = TournamentStandingSerializer(standings, many=True)
        return Response(serializer.data)


# ============================================================================
# R2 DIRECT UPLOAD
# ============================================================================

import boto3
from botocore.client import Config

R2_PUBLIC_BASE = 'https://pub-6049ebe0378041f3addf112314005b1a.r2.dev'


def upload_image_to_r2(image_file, folder='tournament_covers'):
    """Upload image file directly to Cloudflare R2, get back public URL."""
    s3 = boto3.client(
        's3',
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=Config(signature_version='s3v4'),
    )

    key = f'{folder}/{image_file.name}'
    image_file.seek(0)

    s3.put_object(
        Bucket=settings.AWS_STORAGE_BUCKET_NAME,
        Key=key,
        Body=image_file.read(),
        ContentType=image_file.content_type or 'application/octet-stream',
    )

    return f'{R2_PUBLIC_BASE}/{key}'


# ============================================================================
# BACKGROUND TASKS (django-q2)
# ============================================================================

from django_q.tasks import async_task


def notify_tournament_full(tournament_id):
    """Background task: notify all registered players when tournament is full."""
    try:
        tournament = Tournament.objects.get(pk=tournament_id)
        registrations = TournamentRegistration.objects.filter(
            tournament=tournament
        ).select_related('user')

        for reg in registrations:
            user = reg.user
            # Send email notification
            subject = f'Tournament Full: {tournament.name}'
            message = f'''
            Hi {user.username},

            The tournament "{tournament.name}" is now full and will start soon!

            Tournament Details:
            - Name: {tournament.name}
            - Game: {tournament.game.name}
            - Status: {tournament.status}
            - Entry Fee: {tournament.entry_fee}
            - Prize Pool: {tournament.pool_prize}

            Match schedules and standings are now available.
            Good luck!
            '''

            try:
                resend.api_key = settings.RESEND_API_KEY
                resend.Emails.send({
                    "from": settings.DEFAULT_FROM_EMAIL,
                    "to": [user.email],
                    "subject": subject,
                    "html": message,
                })
            except Exception:
                pass  # Don't fail if email fails

        # Create in-app notifications (could be stored in a Notification model)
        # For now, we log the notification
        print(f'Notified {registrations.count()} players that tournament {tournament.name} is full')

    except Exception as e:
        print(f'Error notifying players: {e}')


# ============================================================================
# PLAYER-FACING TOURNAMENT VIEWS
# ============================================================================

class PlayerTournamentListView(APIView):
    """
    GET - List available tournaments for players (status='open' only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tournaments = Tournament.objects.filter(
            status='open'
        ).select_related('game').order_by('start_date')
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)


class PlayerTournamentRegisterView(APIView):
    """
    POST - Player joins a tournament
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, tournament_pk):
        try:
            tournament = Tournament.objects.get(pk=tournament_pk)
        except Tournament.DoesNotExist:
            return Response({'message': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # Prevent double registration
        if TournamentRegistration.objects.filter(tournament=tournament, user=user).exists():
            return Response({'message': 'Already registered for this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check tournament is open for registration
        if tournament.status not in ('draft', 'open'):
            return Response({'message': 'Tournament is not open for registration.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check private join code if applicable
        if tournament.join_type == 'private':
            join_code = request.data.get('join_code')
            if not join_code or join_code != tournament.join_code:
                return Response({'message': 'Invalid or missing join code.'}, status=status.HTTP_403_FORBIDDEN)

        # Check capacity
        if tournament.current_players >= tournament.max_players:
            return Response({'message': 'Tournament is full.'}, status=status.HTTP_400_BAD_REQUEST)

        registration = TournamentRegistration.objects.create(tournament=tournament, user=user)

        # Increment current_players
        Tournament.objects.filter(pk=tournament.pk).update(current_players=F('current_players') + 1)
        tournament.refresh_from_db()

        # Auto-transition status
        if tournament.current_players >= tournament.max_players and tournament.status == 'open':
            tournament.status = 'full'
            tournament.save()
            _generate_standings_and_matches(tournament)
            # Notify players via background task
            async_task(notify_tournament_full, tournament.id)

        serializer = TournamentRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

