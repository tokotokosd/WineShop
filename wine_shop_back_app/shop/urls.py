from django.urls import path, include
from django_email_verification import urls as email_urls
from . import views
from .views import ChangePasswordView

urlpatterns = [
    # Leave as empty string for base url
    path('wineproduct/', views.wineproduct, name="wineproduct"),
    path('brandlist/', views.brandlist, name="brandlist"),
    path('banners/', views.banners, name="banners"),
    path('history/', views.history, name="history"),
    path('address/', views.address, name="address"),
    path('cart/', views.cart, name="cart"),
    path('blog/', views.blog, name="blog"),
    path('blog_comment/', views.post_comment, name="blog_comment"),
    path('current_user/', views.current_user),
    path('users/', views.UserList.as_view()),
    path('buy_process', views.buy_process, name="buy_process"),
    path('buy_process_unregistred', views.buy_process_unregistred, name="buy_process_unregistred"),
    path('callback', views.callback, name="callback"),
    path('email/', include(email_urls)),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
