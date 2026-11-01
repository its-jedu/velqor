from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
from .permissions import RoleChoices

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # Ensure admin role exists
        from .models import Role
        admin_role, _ = Role.objects.get_or_create(name='admin')
        extra_fields.setdefault('role', admin_role)
        return self.create_user(email, password, **extra_fields)

class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'role'
        verbose_name_plural = 'roles'

    def __str__(self):
        return self.name

class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    roles = models.ManyToManyField(Role, related_name='permissions', blank=True)

    class Meta:
        verbose_name = 'permission'
        verbose_name_plural = 'permissions'

    def __str__(self):
        return self.name

class BlacklistedToken(models.Model):
    jti = models.CharField(max_length=255, unique=True)
    token_type = models.CharField(max_length=10)  # access or refresh
    blacklisted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Blacklisted Token'
        verbose_name_plural = 'Blacklisted Tokens'

    def __str__(self):
        return f'{self.token_type}:{self.jti[:8]}'

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, blank=True, null=True, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.ForeignKey('Role', null=True, blank=True, on_delete=models.SET_NULL, related_name='users')
    is_email_verified = models.BooleanField(default=False)
    last_active = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split('@')[0]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
