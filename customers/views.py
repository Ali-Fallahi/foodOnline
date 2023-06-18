import requests
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404, redirect

from accounts.forms import UserProfileForm, UserInfoForm
from accounts.models import UserProfile


# Create your views here.
@login_required(login_url='login')
def cprofile(request):
    profile = get_object_or_404(UserProfile, user=request.user)

    if request.method == 'POST':
        profile_form = UserProfileForm(request.POST, request.FILES, instance=profile)
        user_form = UserInfoForm(request.POST, instance=request.user)
        address = request.POST.get('address')
        try:
            url = "https://us1.locationiq.com/v1/search"

            data = {
                'key': 'pk.b488c4e5d0fcd29ac9ddf8894ef3fbfd',
                'q': address,
                'format': 'json'
            }

            response = requests.get(url, params=data)
            data = response.json()
            result = data[0]
            latitude = result["lat"]
            longitude = result["lon"]
            print("Latitude:", latitude)
            print("Longitude:", longitude)
        except Exception as e:
            print(e)
            latitude = 0
            longitude = 0
        if profile_form.is_valid() and user_form.is_valid():
            profile.address = profile_form.cleaned_data['address']
            profile.city = profile_form.cleaned_data['city']
            profile.state = profile_form.cleaned_data['state']
            profile.country = profile_form.cleaned_data['country']
            profile.pin_code = profile_form.cleaned_data['pin_code']
            profile.latitude = latitude
            profile.longitude = longitude
            profile.save()
            user_form.save()
            messages.success(request, 'Profile updated')
            return redirect('cprofile')
        else:
            print(profile_form.errors)
            print(user_form.errors)
    else:
        profile_form = UserProfileForm(instance=profile)
        user_form = UserInfoForm(instance=request.user)

    context = {
        'profile_form': profile_form,
        'user_form': user_form,
        'profile': profile,
    }
    return render(request, 'customers/cprofile.html', context)
