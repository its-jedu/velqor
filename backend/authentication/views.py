from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.utils import timezone
from .serializers import RegisterSerializer, UserSerializer, LoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, ChangePasswordSerializer
from .models import User, BlacklistedToken
import resend

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        # Lookup user by username, then authenticate using email as USERNAME_FIELD
        try:
            user_obj = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(request, username=user_obj.email, password=password)
        if user is None or not user.is_active:
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        # Serialize before updating last_login so response shows previous login
        user_data = UserSerializer(user).data
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': user_data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'message': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            # Blacklist refresh token via SimpleJWT
            refresh.blacklist()
            # Blacklist refresh jti in custom table
            BlacklistedToken.objects.get_or_create(jti=str(refresh['jti']), defaults={'token_type': 'refresh'})
        except Exception:
            return Response({'message': 'Invalid or expired refresh token'}, status=status.HTTP_400_BAD_REQUEST)

        # Blacklist current access token immediately
        auth_token = getattr(request, 'auth', None)
        if auth_token:
            try:
                jti = auth_token.get('jti')
                token_type = auth_token.get('token_type', 'access')
                if jti:
                    BlacklistedToken.objects.get_or_create(jti=jti, defaults={'token_type': token_type})
            except Exception:
                pass

        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'An account does not exist with this email.'}, status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(str(user.pk)))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"

        subject = 'Reset your Velqor password'
        html = f"""
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:40px auto;background:#fff;padding:32px;border-radius:12px;">
          <h2 style="color:#1f2937;">Reset your Velqor password</h2>
          <p>Hi {user.first_name or user.email},</p>
          <p>We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="{reset_link}" style="background:#111827;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;">Reset Password</a>
          </p>
          <p style="color:#6b7280;font-size:13px;">If you didn’t request this, you can safely ignore this email.</p>
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
        return Response({'message': 'A reset link has been sent to your email.'}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'message': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'message': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
