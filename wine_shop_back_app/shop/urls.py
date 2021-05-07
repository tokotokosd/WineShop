from django.urls import path

from . import views


urlpatterns = [
    # Leave as empty string for base url
    path('wineproduct/', views.wineproduct, name="wineproduct"),
    path('brandlist/', views.brandlist, name="brandlist"),
    path('cart/', views.cart, name="cart"),
    path('blog/', views.blog, name="blog"),
    path('blog_comment/', views.post_comment, name="blog_comment"),
    path('current_user/', views.current_user),
    path('users/', views.UserList.as_view())
]
