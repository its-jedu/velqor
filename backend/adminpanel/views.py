from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser, IsModeratorOrAdmin
from .serializers import (
    UserAdminSerializer, RoleSerializer, PermissionSerializer,
    GameSerializer, TournamentSerializer, TournamentRegistrationSerializer, MatchSerializer,
)
from authentication.models import User, Role, Permission
from authentication.permissions import RoleChoices
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.db.models import Count, Sum, Q, F
from django.db.models.functions import TruncDate
from datetime import timedelta
from django.utils import timezone
import resend

# New admin-panel domain models
from .models import (
    Withdrawal, Dispute, FlaggedAccount, Deposit, Payout,
    Game, Tournament, TournamentRegistration, Match,
)


# ============================================================================
# DASHBOARD & ANALYTICS (existing, kept unchanged)
# ============================================================================

class AdminDashboardView(APIView):
    """Admin home dashboard — high-level counts and activity charts."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        start_date = now - timedelta(days=30)

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(is_email_verified=True).count()

        pending_withdrawals = Withdrawal.objects.filter(status='pending').count()
        open_disputes = Dispute.objects.filter(status='open').count()
        flagged_accounts = FlaggedAccount.objects.filter(is_resolved=False).count()
        results_to_confirm = Match.objects.filter(status='pending').count()

        deposits_daily = (
            Deposit.objects
            .filter(created_at__gte=start_date)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('amount'))
            .order_by('day')
        )
        payouts_daily = (
            Payout.objects
            .filter(created_at__gte=start_date)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('amount'))
            .order_by('day')
        )

        chart_map = {}
        for item in deposits_daily:
            day = item['day'].isoformat()
            chart_map.setdefault(day, {'date': day, 'deposits': 0, 'payouts': 0})
            chart_map[day]['deposits'] = float(item['total'] or 0)
        for item in payouts_daily:
            day = item['day'].isoformat()
            chart_map.setdefault(day, {'date': day, 'deposits': 0, 'payouts': 0})
            chart_map[day]['payouts'] = float(item['total'] or 0)
        deposits_vs_payouts = sorted(chart_map.values(), key=lambda x: x['date'])

        daily_registrations = (
            User.objects.filter(date_joined__gte=start_date)
            .annotate(day=TruncDate('date_joined'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        daily_data = [
            {'date': item['day'].isoformat(), 'count': item['count']}
            for item in daily_registrations
        ]

        recent_signups_qs = (
            User.objects.select_related('role')
            .order_by('-date_joined')[:10]
        )
        recent_signups_data = [
            {
                'id': str(u.id),
                'email': u.email,
                'username': u.username,
                'role': u.role.name if u.role else None,
                'date_joined': u.date_joined.isoformat() if u.date_joined else None,
                'is_email_verified': u.is_email_verified,
            }
            for u in recent_signups_qs
        ]

        recent_users = User.objects.select_related('role').order_by('-date_joined')[:5]
        recent_users_data = UserAdminSerializer(recent_users, many=True).data

        user_role_name = request.user.role.name if getattr(request.user, 'role', None) else None

        return Response({
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'verified_users': verified_users,
                'pending_withdrawals': pending_withdrawals,
                'open_disputes': open_disputes,
                'flagged_accounts': flagged_accounts,
                'results_to_confirm': results_to_confirm,
            },
            'charts': {
                'registrations_last_30_days': daily_data,
                'deposits_vs_payouts': deposits_vs_payouts,
            },
            'recent_signups': recent_signups_data,
            'recent_users': recent_users_data,
            'requested_by': {
                'email': request.user.email,
                'role': user_role_name,
            }
        })


class ModeratorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsModeratorOrAdmin]

    def get(self, request):
        return Response({
            'message': 'Moderator/Admin area',
            'user': request.user.email,
            'role': request.user.role
        })


class AnalyticsView(APIView):
    """Admin analytics / KPI page — zero N+1 queries."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        now = timezone.now()
        start_date = now - timedelta(days=30)

        total_users = User.objects.count()
        active_tournaments = Tournament.objects.filter(status='started').count()

        deposit_volume = (
            Deposit.objects.filter(status='completed')
            .aggregate(total=Sum('amount'))['total'] or 0
        )
        payout_volume = (
            Payout.objects.filter(status='completed')
            .aggregate(total=Sum('amount'))['total'] or 0
        )
        total_volume = float(deposit_volume) + float(payout_volume)

        active_players = User.objects.filter(
            Q(deposits__created_at__gte=start_date) |
            Q(withdrawals__created_at__gte=start_date) |
            Q(matches_as_player_one__played_at__gte=start_date) |
            Q(matches_as_player_two__played_at__gte=start_date)
        ).distinct().count()

        pending_withdrawals = Withdrawal.objects.filter(status='pending').count()
        completed_withdrawals = Withdrawal.objects.filter(status='completed').count()
        open_disputes = Dispute.objects.filter(status='open').count()
        flagged_accounts = FlaggedAccount.objects.filter(is_resolved=False).count()
        results_to_confirm = Match.objects.filter(status='pending').count()

        upcoming_tournaments = Tournament.objects.filter(status='open').count()
        completed_tournaments = Tournament.objects.filter(status='completed').count()

        total_deposits_amount = (
            Deposit.objects.filter(status='completed')
            .aggregate(total=Sum('amount'))['total'] or 0
        )
        total_payouts_amount = (
            Payout.objects.filter(status='completed')
            .aggregate(total=Sum('amount'))['total'] or 0
        )

        user_growth = (
            User.objects.filter(date_joined__gte=start_date)
            .annotate(day=TruncDate('date_joined'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        user_growth_data = [
            {'date': item['day'].isoformat(), 'count': item['count']}
            for item in user_growth
        ]

        deposit_volume_daily = (
            Deposit.objects.filter(created_at__gte=start_date, status='completed')
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('amount'))
            .order_by('day')
        )
        deposit_volume_chart = [
            {'date': item['day'].isoformat(), 'volume': float(item['total'] or 0)}
            for item in deposit_volume_daily
        ]

        tournament_distribution = list(
            Tournament.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )

        top_players = (
            User.objects.select_related('role')
            .annotate(total_payouts=Sum('payouts__amount', filter=Q(payouts__status='completed')))
            .filter(total_payouts__gt=0)
            .order_by('-total_payouts')[:10]
        )
        top_players_data = [
            {
                'id': str(u.id),
                'email': u.email,
                'username': u.username,
                'role': u.role.name if u.role else None,
                'total_payouts': float(u.total_payouts or 0),
            }
            for u in top_players
        ]

        recent_signups = (
            User.objects.select_related('role')
            .order_by('-date_joined')[:20]
        )
        recent_signups_data = [
            {
                'id': str(u.id),
                'email': u.email,
                'username': u.username,
                'role': u.role.name if u.role else None,
                'date_joined': u.date_joined.isoformat() if u.date_joined else None,
            }
            for u in recent_signups
        ]

        return Response({
            'kpis': {
                'total_users': total_users,
                'active_tournaments': active_tournaments,
                'total_volume': round(total_volume, 2),
                'active_players': active_players,
                'pending_withdrawals': pending_withdrawals,
                'completed_withdrawals': completed_withdrawals,
                'open_disputes': open_disputes,
                'flagged_accounts': flagged_accounts,
                'results_to_confirm': results_to_confirm,
                'upcoming_tournaments': upcoming_tournaments,
                'completed_tournaments': completed_tournaments,
                'total_deposits': round(float(total_deposits_amount), 2),
                'total_payouts': round(float(total_payouts_amount), 2),
            },
            'charts': {
                'user_growth_last_30_days': user_growth_data,
                'deposit_volume_last_30_days': deposit_volume_chart,
                'tournament_distribution': tournament_distribution,
            },
            'top_players': top_players_data,
            'recent_signups': recent_signups_data,
        })


# ============================================================================
# USERS / ROLES / PERMISSIONS CRUD (existing, kept unchanged)
# ============================================================================

class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.select_related('role').order_by('-date_joined')
        serializer = UserAdminSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_obj = serializer.validated_data.get('role')
        role_name = role_obj.name if role_obj else None
        if role_name == 'admin' and not request.user.is_superuser:
            return Response({'message': 'Only superadmin can create admin users.'}, status=status.HTTP_403_FORBIDDEN)
        admin_role, _ = Role.objects.get_or_create(name='admin')
        serializer.validated_data['role'] = admin_role
        serializer.validated_data['is_staff'] = True
        user = serializer.save()
        if not user.has_usable_password():
            uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
            subject = 'Your Velqor admin account has been created'
            html = f"""
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:40px auto;background:#fff;padding:32px;border-radius:12px;">
              <h2 style="color:#1f2937;">Welcome to Velqor Admin</h2>
              <p>Hi {user.first_name or user.email},</p>
              <p>Your admin account has been created on Velqor.</p>
              <p>Click the button below to set your password and login.</p>
              <p style="text-align:center;margin:32px 0;">
                <a href="{reset_link}" style="background:#111827;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">Set Password</a>
              </p>
              <p style="color:#6b7280;font-size:13px;">Login with username: {user.username}<br/>This link expires in 1 hour.</p>
            </div>
            """
            try:
                resend.api_key = settings.RESEND_API_KEY
                resend.Emails.send({
                    "from": settings.DEFAULT_FROM_EMAIL,
                    "to": [user.email],
                    "subject": subject,
                    "html": html,
                })
            except Exception:
                pass
        return Response(UserAdminSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return User.objects.select_related('role').get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserAdminSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserAdminSerializer(user).data)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)


class RoleListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        roles = Role.objects.all()
        return Response(RoleSerializer(roles, many=True).data)

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)


class RoleDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return Role.objects.get(pk=pk)
        except Role.DoesNotExist:
            return None

    def get(self, request, pk):
        role = self.get_object(pk)
        if not role:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RoleSerializer(role).data)

    def patch(self, request, pk):
        role = self.get_object(pk)
        if not role:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        return Response(RoleSerializer(role).data)

    def delete(self, request, pk):
        role = self.get_object(pk)
        if not role:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        role.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PermissionListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        perms = Permission.objects.prefetch_related('roles')
        return Response(PermissionSerializer(perms, many=True).data)

    def post(self, request):
        serializer = PermissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        perm = serializer.save()
        return Response(PermissionSerializer(perm).data, status=status.HTTP_201_CREATED)


class PermissionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        try:
            return Permission.objects.prefetch_related('roles').get(pk=pk)
        except Permission.DoesNotExist:
            return None

    def get(self, request, pk):
        perm = self.get_object(pk)
        if not perm:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PermissionSerializer(perm).data)

    def patch(self, request, pk):
        perm = self.get_object(pk)
        if not perm:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PermissionSerializer(perm, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        perm = serializer.save()
        return Response(PermissionSerializer(perm).data)

    def delete(self, request, pk):
        perm = self.get_object(pk)
        if not perm:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        perm.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        # Prevent deletion if tournaments reference this game
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
        # Optional filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            tournaments = tournaments.filter(status=status_filter)
        serializer = TournamentSerializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TournamentSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()
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
        serializer = TournamentSerializer(tournament, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        tournament = serializer.save()
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
        return Response(status=status.HTTP_204_NO_CONTENT)


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
            Tournament.objects.filter(pk=tournament.pk).update(status='full')

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
        match = serializer.save()
        return Response(MatchSerializer(match).data)

    def delete(self, request, pk):
        match = self.get_object(pk)
        if not match:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
