from django.contrib import admin

# Register your models here.

from .models import *
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'image_tag']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser or request.user.groups.filter(name = 'Overwatch').exists() or request.user.groups.filter(name = 'Warehouse').exists() :
            return qs
        return qs.filter(brand=Brand.objects.get(user=request.user))

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'date_order', 'complete', 'pay_id', 'delivered']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'order', 'quantity', 'date_added']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser or request.user.groups.filter(name = 'Overwatch').exists() or request.user.groups.filter(name = 'Warehouse').exists() :
            return qs
        return qs.filter(product=Product.objects.filter(brand=Brand.objects.get(user=request.user)))

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ['tittle', 'content', 'time']

@admin.register(BlogComments)
class BlogCommentsAdmin(admin.ModelAdmin):
    list_display = ['blog', 'username', 'comment']

@admin.register(ShippingAddres)
class ShippingAddresCommentsAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'address', 'first_last_name']

admin.site.register(Customer)
admin.site.register(Brand)
admin.site.register(Banner)
