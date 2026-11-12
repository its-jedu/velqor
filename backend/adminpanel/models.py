from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta
import uuid
import string
import random

User = get_user_model()


def generate_join_code(length=8):
    """Generate a random alphanumeric join code for private tournaments."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


# ============================================================================
# DASHBOARD MODELS (Withdrawal, Dispute, FlaggedAccount, Deposit, Payout)
# ============================================================================

class Withdrawal(models.Model):
    """Player withdrawal requests."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='withdrawals', db_index=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='withdrawal_status_created_idx'),
            models.Index(fields=['user', '-created_at'], name='withdrawal_user_created_idx'),
            models.Index(fields=['-created_at'], name='withdrawal_recent_idx'),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} ({self.status})'


class Dispute(models.Model):
    """Player-disputed matches or transactions."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_review', 'In Review'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='disputes', db_index=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open', db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='dispute_status_created_idx'),
            models.Index(fields=['user', '-created_at'], name='dispute_user_created_idx'),
        ]

    def __str__(self):
        return self.title


class FlaggedAccount(models.Model):
    """Accounts flagged by admins or automated systems."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='flags', db_index=True
    )
    reason = models.CharField(max_length=200)
    flagged_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='flags_set', db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    resolved_at = models.DateTimeField(null=True, blank=True, db_index=True)
    is_resolved = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['is_resolved', 'created_at'], name='flag_resolved_created_idx'
            ),
            models.Index(fields=['user', '-created_at'], name='flag_user_created_idx'),
        ]

    def __str__(self):
        return f'Flag: {self.user.email}'


class Deposit(models.Model):
    """Player deposits into their wallet."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='deposits', db_index=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='deposit_status_created_idx'),
            models.Index(fields=['user', '-created_at'], name='deposit_user_created_idx'),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} ({self.status})'


class Payout(models.Model):
    """Platform payouts to players (winnings, etc.)."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='payouts', db_index=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='payout_status_created_idx'),
            models.Index(fields=['user', '-created_at'], name='payout_user_created_idx'),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} ({self.status})'


# ============================================================================
# TOURNAMENT MODELS
# ============================================================================

class Game(models.Model):
    """Supported eSports games (e.g. eFootball, FIFA, COD Mobile, 8 Ball Pool)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    platform = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name', 'is_active'], name='game_name_active_idx'),
        ]

    def __str__(self):
        return self.name


class Tournament(models.Model):
    """eSports tournaments with full prize pool, registration, and status lifecycle."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('full', 'Full'),
        ('started', 'Started'),
        ('completed', 'Completed'),
    ]

    JOIN_TYPE_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    TOURNAMENT_TYPE_CHOICES = [
        ('league', 'League'),
        ('cup', 'Cup'),
    ]

    CUP_TYPE_CHOICES = [
        ('knockout', 'Knockout'),
        ('group_stage', 'Group Stage'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name='tournaments', db_index=True
    )
    platform = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.URLField(blank=True, null=True)

    # Format (only enforced meaningfully for eFootball)
    tournament_type = models.CharField(
        max_length=20, choices=TOURNAMENT_TYPE_CHOICES, blank=True, null=True
    )
    cup_type = models.CharField(
        max_length=20, choices=CUP_TYPE_CHOICES, blank=True, null=True
    )
    allows_third_place = models.BooleanField(default=False)

    # Visibility & joining
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True
    )
    join_type = models.CharField(
        max_length=20, choices=JOIN_TYPE_CHOICES, default='public', db_index=True
    )
    join_code = models.CharField(
        max_length=10, blank=True, null=True, unique=True, db_index=True
    )

    # Player limits
    min_players = models.PositiveIntegerField(
        default=8, validators=[MinValueValidator(8), MaxValueValidator(64)]
    )
    max_players = models.PositiveIntegerField(
        default=64, validators=[MinValueValidator(8), MaxValueValidator(64)]
    )
    current_players = models.PositiveIntegerField(default=0, db_index=True)

    # Money
    entry_fee = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(1000)], default=1000
    )
    pool_prize = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prize_1st = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prize_2nd = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prize_3rd = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Dates
    registration_open_date = models.DateTimeField(default=timezone.now, db_index=True)
    registration_close_date = models.DateTimeField(default=timezone.now, db_index=True)
    start_date = models.DateTimeField(null=True, blank=True, db_index=True)
    end_date = models.DateTimeField(null=True, blank=True)

    # Rules & metadata
    rules = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_tournaments', db_index=True,
        null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='tournament_status_created_idx'),
            models.Index(fields=['game', 'status'], name='tournament_game_status_idx'),
            models.Index(fields=['join_type', 'status'], name='tournament_join_status_idx'),
        ]

    def __str__(self):
        return self.name

    def calculate_prize_pool(self):
        """Calculate platform fee, pool prize, and prize splits."""
        total_collection = self.entry_fee * self.max_players
        self.platform_fee = round(total_collection * 0.30, 2)
        self.pool_prize = round(total_collection - self.platform_fee, 2)
        self.prize_1st = round(self.pool_prize * 0.60, 2)
        self.prize_2nd = round(self.pool_prize * 0.25, 2)
        self.prize_3rd = round(self.pool_prize * 0.15, 2)

    def save(self, *args, **kwargs):
        # Auto-generate join code for private tournaments
        if self.join_type == 'private' and not self.join_code:
            self.join_code = generate_join_code()

        # Auto-calculate prize pool
        self.calculate_prize_pool()

        # Auto-set end_date = start_date + 2 weeks if start_date is set
        if self.start_date and not self.end_date:
            self.end_date = self.start_date + timedelta(weeks=2)

        super().save(*args, **kwargs)


class TournamentRegistration(models.Model):
    """Players registered for a tournament."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name='registrations', db_index=True
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='tournament_registrations', db_index=True
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    class Meta:
        unique_together = ['tournament', 'user']
        indexes = [
            models.Index(fields=['tournament', 'user'], name='reg_tournament_user_idx'),
            models.Index(fields=['user', '-joined_at'], name='reg_user_joined_idx'),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.tournament.name}'


class Match(models.Model):
    """Individual match within a tournament."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name='matches', db_index=True
    )
    player_one = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='matches_as_player_one', db_index=True
    )
    player_two = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='matches_as_player_two', db_index=True
    )
    winner = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='matches_won', db_index=True
    )
    player_one_score = models.PositiveIntegerField(default=0)
    player_two_score = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    played_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tournament', 'status'], name='match_tournament_status_idx'),
            models.Index(fields=['-created_at'], name='match_recent_idx'),
        ]

    def __str__(self):
        return f'Match {self.id} - {self.tournament.name}'
