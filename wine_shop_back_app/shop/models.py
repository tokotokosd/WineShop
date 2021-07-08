from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail
from image_optimizer.fields import OptimizedImageField

# Create your models here.

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200, null=True, blank=True)
    email = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=200, null=True)
    image = OptimizedImageField(
        upload_to='uploads/collaborators/%Y/%m/%d',
        optimized_image_output_size=(100, 100),
        optimized_image_resize_method='thumbnail',  # 'thumbnail', 'cover' or None
        null = True, blank = True
    )

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=True)
    price = models.FloatField()
    sale = models.FloatField(null=True, blank=True)
    year = models.CharField(max_length=200, null=True, blank=True)
    alcoholPercent = models.CharField(max_length=200, null=True, blank=True)
    color = models.CharField(max_length=200, null=True, blank=True)
    region = models.CharField(max_length=200, null=True, blank=True)
    variety = models.CharField(max_length=200, null=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, blank=True, null=True)
    type = models.CharField(max_length=200, null=True, blank=True)
    description = models.CharField(max_length=200, null=True, blank=True)
    image = OptimizedImageField(
        upload_to='uploads/collaborators/%Y/%m/%d',
        optimized_image_output_size=(200, 620),
        optimized_image_resize_method='thumbnail',
        null=True, blank=True
    )
    quantity = models.IntegerField(default=1)
    production_technology = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url = ''
        return url

    def image_tag(self):
        from django.utils.safestring import mark_safe
        return mark_safe('<image src="%s" width="60" height="200" />' % self.imageURL)

    image_tag.short_description = 'Image'
    image_tag.allow_tags = True



class ShippingAddres(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, blank=True, null=True)
    address = models.CharField(max_length=200, null=True)
    phone = models.CharField(max_length=200, null=True)
    first_last_name = models.CharField(max_length=200, null=True)
    comment = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.address + " / " + self.phone + " / " + self.first_last_name


class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, blank=True, null=True)
    date_order = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(default=False, null=True, blank=False)
    pay_id = models.CharField(max_length=200, null=True)
    address = models.ForeignKey(ShippingAddres, on_delete=models.SET_NULL, blank=True, null=True)
    delivered = models.BooleanField(default=False, null=True, blank=False)

    def __str__(self):
        return str(self.id)

    @property
    def get_cart_total(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.get_total for item in orderitems])
        return total



class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, blank=True, null=True)
    quantity = models.IntegerField(default=0, null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    @property
    def get_total(self):
        total = self.product.price * self.quantity
        return total



class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    image = OptimizedImageField(
        upload_to='uploads/collaborators/%Y/%m/%d',
        null=True, blank=True
    )
    time = models.DateTimeField(auto_now_add=True)
    tittle = models.CharField(max_length=100, null=True)
    content = models.CharField(max_length=999, null=True)

    def __str__(self):
        return self.tittle

class BlogComments(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.SET_NULL, blank=True, null=True)
    comment = models.CharField(max_length=400, null=True)
    username = models.ForeignKey(Customer, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.username.name


class Banner(models.Model):
    img = OptimizedImageField(
        upload_to='uploads/collaborators/%Y/%m/%d',
        optimized_image_output_size=(1140, 475),
        optimized_image_resize_method='thumbnail',
        null=True, blank=True
    )
    text = models.CharField(max_length=400, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.product.name

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    email_plaintext_message = "https://spirit.ge/reset-password.html#token={}".format( reset_password_token.key)

    send_mail(
        # title:
        "Password Reset for {title}".format(title="Spirit.ge"),
        # message:
        email_plaintext_message,
        # from:
        "noreply@somehost.local",
        # to:
        [reset_password_token.user.email]
    )