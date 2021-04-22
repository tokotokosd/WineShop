from django.shortcuts import render
from shop.models import Product, Brand, Order, Customer, OrderItem
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


# Create your views here.

def wineproduct(request):
    data = {'menu': ''}
    if request.method == 'GET':
        wine = request.GET.get('wine')
        if wine:
            data['menu'] = list(Product.objects.all().values("id", "name", "price", "year",
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
            serializer.save()
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
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
        items = list(order.orderitem_set.all().values())

        context = {"items": items}

        return HttpResponse(json.dumps(context, indent=1, cls=DjangoJSONEncoder), content_type="application/json")
    if request.method == 'POST':
        body = json.loads(request.body)
        action = body['action']
        productId = body['productId']

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

        if orderItem.quantity <= 0:
            orderItem.delete()

        return JsonResponse('item was added', safe=False)