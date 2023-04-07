from django.shortcuts import render
from django.http import HttpResponse

def home(self):
    return HttpResponse('Helo World')