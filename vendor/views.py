from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test
import requests
from django.shortcuts import render, get_object_or_404, redirect

from accounts.forms import UserProfileForm
from accounts.models import UserProfile
from accounts.views import check_role_vendor
from vendor.forms import VendorForm
from vendor.models import Vendor
from decouple import config

headers = {
    "Api-Key": config('NESHAN_API_KEY'),
}


# Create your views here.
@login_required(login_url='login')
@user_passes_test(check_role_vendor)
def vprofile(request):
    profile = get_object_or_404(UserProfile, user=request.user)
    vendor = get_object_or_404(Vendor, user=request.user)

    if request.method == 'POST':
        profile_form = UserProfileForm(request.POST, request.FILES, instance=profile)
        vendor_form = VendorForm(request.POST, request.FILES, instance=vendor)
        address = request.POST.get('address')
        neshan = requests.get(
            f"https://api.neshan.org/v4/geocoding?address={address}",
            headers=headers)
        x = neshan.json()['location']['x']
        y = neshan.json()['location']['y']
        print(x, y)
        if profile_form.is_valid() and vendor_form.is_valid():
            profile.address = profile_form.cleaned_data['address']
            profile.city = profile_form.cleaned_data['city']
            profile.state = profile_form.cleaned_data['state']
            profile.country = profile_form.cleaned_data['country']
            profile.pin_code = profile_form.cleaned_data['pin_code']
            profile.latitude = x
            profile.longitude = y
            profile.save()
            vendor_form.save()
            messages.success(request, 'Settings updated.')
            return redirect('vprofile')
        else:
            print(profile_form.errors)
            print(vendor_form.errors)
    else:
        profile_form = UserProfileForm(instance=profile)
        vendor_form = VendorForm(instance=vendor)
    context = {
        'profile_form': profile_form,
        'vendor_form': vendor_form,
        'profile': profile,
        'vendor': vendor,
    }
    return render(request, 'vendor/vprofile.html', context)
