from django.contrib import admin

# Register your models here.

from .models import *
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'image_tag']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'date_order', 'complete', 'pay_id']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'order', 'quantity', 'date_added']

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
