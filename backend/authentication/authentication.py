from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import BlacklistedToken

class BlacklistJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        jti = validated_token.get('jti')
        token_type = validated_token.get('token_type')
        if jti and BlacklistedToken.objects.filter(jti=jti, token_type='access').exists():
            raise InvalidToken('Session expired. Please login again.')
        return self.get_user(validated_token), validated_token
