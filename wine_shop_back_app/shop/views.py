from django.shortcuts import render
from shop.models import *
from django.http import JsonResponse, HttpResponse
from django.core import serializers
import json
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, UserSerializerWithToken
from django.core.serializers.json import DjangoJSONEncoder
import requests
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django_email_verification import send_email
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import ChangePasswordSerializer
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail as send_mail_core

env = "api.tbcbank.ge"
app_key = "lOwrKb8uy75GGwoIXO11tjl44L8Atlap"
web_client_id = "7000200"
web_client_secret = "ba0a46"


# Create your views here.
def blog(request):
    data = {'blog': ''}
    if request.method == 'GET':
        try:
            data['blog'] = list(Blog.objects.all().values())
            data['comments'] = list(BlogComments.objects.all().values('blog', 'comment', 'username__name'))
        except:
            data['menu'] = ' does not exists.'
    return HttpResponse(json.dumps(data, sort_keys=True, indent=1, cls=DjangoJSONEncoder),
                        content_type="application/json")


def wineproduct(request):
    data = {'menu': ''}
    if request.method == 'GET':
        wine = request.GET.get('wine')
        if wine:
            data['menu'] = list(Product.objects.all().values("id", "name", "price", "sales", "year",
                                                             "alcoholPercent", "color", "region",
                                                             "variety", "brand_id__name", "type", "description",
                                                             "image", "quantity", "production_technology"))
        else:
            data['menu'] = wine + ' does not exists.'
    return HttpResponse(json.dumps(data), content_type="application/json")


def brandlist(request):
    data = {'menu': ''}
    if request.method == 'GET':
        try:
            data['menu'] = list(Brand.objects.all().values())
        except:
            data['menu'] = 'does not exists.'
    return HttpResponse(json.dumps(data), content_type="application/json")


@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    serializer = UserSerializer(request.user)
    print(serializer.data)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            user =  serializer.save()
            user = get_user_model().objects.get(username=serializer.data['username'])
            user.is_active = False
            send_email(user)
            send_mail_core(
                'Subject here',
                'Here is the message.',
                'from@example.com',
                ['to@example.com'],
                fail_silently=True,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def cart(request):
    serializer = UserSerializer(request.user)
    user = User.objects.get(username=serializer['username'].value)
    if request.method == 'GET':
        try:
            customer = user.customer
        except:
            customer = Customer.objects.get_or_create(user=user, name=user.first_name,
                                                      email=user.email)
        print(customer)
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        items = list(order.orderitem_set.all().values())

        context = {"items": items}

        return HttpResponse(json.dumps(context, indent=1, cls=DjangoJSONEncoder), content_type="application/json")
    if request.method == 'POST':
        body = json.loads(request.body)
        action = body['action']
        productId = body['productId']
        try:
            quantity = body['quantity']
            print('quantity', quantity)
        except:
            pass

        print('action', action)
        print('productID', productId)
        customer = user.customer
        product = Product.objects.get(id=productId)
        order, created = Order.objects.get_or_create(customer=customer, complete=False)

        orderItem, created = OrderItem.objects.get_or_create(order=order, product=product)

        if action == 'add':
            orderItem.quantity = (orderItem.quantity + 1)
            orderItem.save()
        elif action == 'remove':
            orderItem.quantity = (orderItem.quantity - 1)
            orderItem.save()
        elif action == 'removeAll':
            orderItem.delete()
        elif action == 'quantity':
            orderItem.quantity = quantity
            orderItem.save()

        if orderItem.quantity <= 0:
            orderItem.delete()

        return JsonResponse('item was added', safe=False)


@api_view(['POST'])
def post_comment(request):
    serializer = UserSerializer(request.user)
    user = User.objects.get(username=serializer['username'].value)

    if request.method == 'POST':
        body = json.loads(request.body)
        comment = body['comment']
        blog_id = body['blog']

        blog = Blog.objects.get(id=blog_id)
        customer = user.customer
        BlogComments.objects.create(blog=blog, username=customer, comment=comment)

        return Response('Succefuly Commented')


@api_view(['POST'])
def buy_process(request):
    body = json.loads(request.body)
    headers = {'apikey': app_key}

    data = {"client_id": web_client_id,
            "client_secret": web_client_secret
            }
    url = "https://" + env + "/v1/tpay/access-token"

    language = body['language']
    shipping = body['shipping']['id']


    serializer = UserSerializer(request.user)
    customer = User.objects.get(username=serializer['username'].value).customer
    print(customer)
    order, created = Order.objects.get_or_create(customer=customer, complete=False)
    order.address = ShippingAddres.objects.get(id=shipping)
    order.save()

    if request.method == 'POST':
        response = requests.post(url, data=data, headers=headers)

        # get access token
        access_token = json.loads(response.content)['access_token']
        headers = {'Authorization': 'Bearer ' + access_token, 'apikey': app_key, 'Content-Type': 'application/json'}
        url = "https://" + env + "/v1/tpay/payments"

        data = {"amount": {"currency": "GEL", "total": 0.01},
                "returnurl": "http://spirit.ge/",
                "expirationMinutes": "5",
                "methods": [5],
                "callbackUrl": "https://spirit.ge:8000/callback",
                "preAuth": True,
                "language": language,
                "merchantPaymentId": "PID" + str(order.id),
                "saveCard": False
                }

        response = requests.post(url, data=json.dumps(data), headers=headers)
        print(response.content)
        url_chek = json.loads(response.content)['links'][0]['uri']
        url_buy = json.loads(response.content)['links'][1]['uri']
        return HttpResponse(json.dumps({'link': url_buy}), content_type="application/json")

@csrf_exempt
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def buy_process_unregistred(request):
    body = json.loads(request.body)
    headers = {'apikey': app_key}

    data = {"client_id": web_client_id,
            "client_secret": web_client_secret
            }
    url = "https://" + env + "/v1/tpay/access-token"

    shipping = body['shipping']
    order_data = body['order']
    language = body['language']


    shop = ShippingAddres.objects.create(address=shipping['address'], phone=shipping['phone'],
                                             first_last_name=shipping['first_last_name'])
    shop.save()

    order = Order.objects.create(complete=False, address=shop)

    for i in order_data:
        product = Product.objects.get(id=i['product_id'])
        orderItem, created = OrderItem.objects.get_or_create(order=order, product=product, quantity=i['quantity'])


    if request.method == 'POST':

        # get access token
        try:
            response = requests.post(url, data=data, headers=headers)
            access_token = json.loads(response.content)['access_token']
        except:
            print(response.content)

        headers = {'Authorization': 'Bearer ' + access_token, 'apikey': app_key, 'Content-Type': 'application/json'}
        url = "https://" + env + "/v1/tpay/payments"

        data = {"amount": {"currency": "GEL", "total": 0.01},
                "returnurl": "http://spirit.ge/",
                "expirationMinutes": "5",
                "methods": [5],
                "callbackUrl": "https://spirit.ge:8000/callback",
                "preAuth": True,
                "language": language,
                "merchantPaymentId": "PID" + str(order.id),
                "saveCard": False
                }

        response = requests.post(url, data=json.dumps(data), headers=headers)
        print(response.content)
        url_chek = json.loads(response.content)['links'][0]['uri']
        url_buy = json.loads(response.content)['links'][1]['uri']
        return HttpResponse(json.dumps({'link': url_buy}), content_type="application/json")


@csrf_exempt
@renderer_classes((TemplateHTMLRenderer, JSONRenderer))
def callback(request):
    print(request.body)
    # get token and set token
    headers = {'apikey': app_key}

    data = {"client_id": web_client_id,
            "client_secret": web_client_secret
            }
    url = "https://" + env + "/v1/tpay/access-token"
    response = requests.post(url, data=data, headers=headers)

    access_token = json.loads(response.content)['access_token']
    headers = {'Authorization': 'Bearer ' + access_token, 'apikey': app_key, 'Content-Type': 'application/json'}
    paymentid = json.loads(request.body)['PaymentId']
    url = "https://" + env + "/v1/tpay/payments/" + paymentid
    response = requests.get(url, headers=headers)

    # print(response.content)

    # get payment data
    paymentdata = json.loads(response.content)
    resultCode = paymentdata['resultCode']
    merchantPaymentId = paymentdata['merchantPaymentId'][3:]
    payId = paymentdata['payId']
    # check data and change order
    if resultCode == 'approved':
        order = Order.objects.get(id=merchantPaymentId)
        order.complete = True
        order.pay_id = payId


        # send data about new email
        Warehouse = User.objects.filter(groups__name='Warehouse')
        Overwatch = User.objects.filter(groups__name='Overwatch')


        for elements in [Warehouse, Overwatch]:
            for user in elements:
                send_mail_core(
                    'New Order',
                    'Order with id( ' + str(order.id) + ' ) is Approved',
                    'shop@spirit.ge',
                    [user.email],
                    fail_silently=False,
                )

                print(user.email)

        order.save()

    return HttpResponse('')


def banners(request):
    data = {'menu': ''}
    if request.method == 'GET':
        try:
            data = list(Banner.objects.all().values())
        except:
            data['menu'] = 'does not exists.'
    return HttpResponse(json.dumps(data), content_type="application/json")


@api_view(['GET'])
def history(request):
    data = {'menu': ''}
    serializer = UserSerializer(request.user)
    user = User.objects.get(username=serializer['username'].value)
    customer = user.customer
    orders = Order.objects.all().filter(customer=customer).values('id', 'complete', 'date_order','address__address' )
    history = []
    if request.method == 'GET':
        for order in orders:
            order_new = {}
            order_new['id'] = order['id']
            order_new['complete'] = order['complete']
            order_new['delivered'] = order['delivered']
            order_new['date_order'] = order['date_order']
            order_new['total_price'] = Order.objects.get(id=order['id']).get_cart_total
            order_new['order_address'] = order['address__address']
            order_new['order_products'] = list(
                OrderItem.objects.all().filter(order_id=order['id']).values('quantity', 'product__price',
                                                                            'product__name'))
            history.append(order_new)
        try:
            data = history
        except:
            data['menu'] = 'does not exists.'
    return HttpResponse(json.dumps(data, indent=1, cls=DjangoJSONEncoder), content_type="application/json")

@api_view(['GET', 'POST'])
def address(request):
    serializer = UserSerializer(request.user)
    user = User.objects.get(username=serializer['username'].value)
    if request.method == 'GET':
        try:
            customer = user.customer
        except:
            customer = Customer.objects.get_or_create(user=user, name=user.first_name,
                                                      email=user.email)
        print(customer)
        address = ShippingAddres.objects.all().filter(customer=customer).values()
        items = list(address.values())

        context = {"items": items}

        return HttpResponse(json.dumps(context, indent=1, cls=DjangoJSONEncoder), content_type="application/json")
    if request.method == 'POST':
        body = json.loads(request.body)
        print(body)
        action = body['action']
        info = body['info']

        print('action', action)
        print('info', info)
        customer = user.customer

        if action == 'add':
            shop = ShippingAddres.objects.create(customer=customer, address=info['address'], phone=info['phone'], first_last_name=info['first_last_name'])
            shop.save()
        elif action == 'delete':
            ShippingAddres.objects.get(id=info['id']).delete()
        elif action == 'choose':
            customer = user.customer
            order, created = Order.objects.get_or_create(customer=customer, complete=False)
            order.address = ShippingAddres.objects.get(id=info['id'])
            order.save()

        return JsonResponse('item was added', safe=False)

class ChangePasswordView(generics.UpdateAPIView):
    """
    An endpoint for changing password.
    """
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)