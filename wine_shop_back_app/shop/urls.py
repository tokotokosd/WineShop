from django.urls import path

from . import views


urlpatterns = [
    # Leave as empty string for base url
    path('wineproduct/', views.wineproduct, name="wineproduct"),
    path('current_user/', views.current_user),
    path('users/', views.UserList.as_view())
]
