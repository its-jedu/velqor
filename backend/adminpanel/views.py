from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUser, IsModeratorOrAdmin
from .serializers import UserAdminSerializer, RoleSerializer, PermissionSerializer
from authentication.models import User, Role, Permission
from authentication.permissions import RoleChoices
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.db.models import Count
from django.db.models.functions import TruncDate
from datetime import timedelta
from django.utils import timezone
import resend

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        verified_users = User.objects.filter(is_email_verified=True).count()

        start_date = timezone.now() - timedelta(days=30)
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

        recent_users = User.objects.select_related('role').order_by('-date_joined')[:5]
        recent_users_data = UserAdminSerializer(recent_users, many=True).data

        # Ensure request user role is loaded to avoid extra query
        user_role_name = request.user.role.name if getattr(request.user, 'role', None) else None

        return Response({
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'verified_users': verified_users,
            },
            'charts': {
                'registrations_last_30_days': daily_data,
            },
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

class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.select_related('role').order_by('-date_joined')
        serializer = UserAdminSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only superadmin can create admin users
        serializer = UserAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_obj = serializer.validated_data.get('role')
        role_name = role_obj.name if role_obj else None
        if role_name == 'admin' and not request.user.is_superuser:
            return Response({'message': 'Only superadmin can create admin users.'}, status=status.HTTP_403_FORBIDDEN)
        # Force admin role for this endpoint
        admin_role, _ = Role.objects.get_or_create(name='admin')
        serializer.validated_data['role'] = admin_role
        serializer.validated_data['is_staff'] = True
        user = serializer.save()
        # If password not set, notify user to reset password
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
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserAdminSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserAdminSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserAdminSerializer(user).data)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({'message':'User deleted successfully.'}, status=status.HTTP_200_OK)

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
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RoleSerializer(role).data)

    def patch(self, request, pk):
        role = self.get_object(pk)
        if not role:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()
        return Response(RoleSerializer(role).data)

    def delete(self, request, pk):
        role = self.get_object(pk)
        if not role:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
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
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PermissionSerializer(perm).data)

    def patch(self, request, pk):
        perm = self.get_object(pk)
        if not perm:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PermissionSerializer(perm, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        perm = serializer.save()
        return Response(PermissionSerializer(perm).data)

    def delete(self, request, pk):
        perm = self.get_object(pk)
        if not perm:
            return Response({'message':'Not found'}, status=status.HTTP_404_NOT_FOUND)
        perm.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
