from django.shortcuts import render
from shop.models import Product
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


@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    serializer = UserSerializer(request.user)
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