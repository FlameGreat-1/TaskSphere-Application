from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from accounts import views
from django.http import HttpResponse
from config.socketio_app import sio
import socketio
import debug_toolbar

def health_check(request):
    return HttpResponse("OK")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/user_profile/', include('user_profile.urls', namespace='user_profile')),
    path('api/', include('api.urls')),
    path('activate/<str:uidb64>/<str:token>/<int:user_id>/', views.activate_account, name='activate_account'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    re_path(r'^socket.io/', socketio.ASGIApp(sio)),
    path('health/', health_check, name='health_check'),
    path('api/', include('Tasks.urls')),
    #path('api/', include('Notifications.urls')),
    path('api/notifications/', include('Notifications.urls')),

]

if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

