from django.shortcuts import render
from shop.models import Product
from django.http import JsonResponse, HttpResponse
from django.core import serializers
import json

# Create your views here.

def wineproduct(request):
    data = {'menu': ''}
    if request.method == 'GET':
        wine = request.GET.get('wine')
        if wine:
            data['menu'] = list(Product.objects.all().values())
        else:
            data['menu'] = wine + ' does not exists.'
    return HttpResponse(json.dumps(data), content_type="application/json")
