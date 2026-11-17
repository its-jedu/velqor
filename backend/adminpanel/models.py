from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()


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
