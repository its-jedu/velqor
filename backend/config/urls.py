"""
URL configuration for config project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse
from adminpanel.urls import player_urlpatterns as player_urls

def health_check(request):
    return JsonResponse({'status':'ok','timestamp': __import__('datetime').datetime.utcnow().isoformat()})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health'),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/admin/', include('adminpanel.urls')),
    path('api/v1/', include(player_urls)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
