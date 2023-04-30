from django.db.models import Prefetch
from django.shortcuts import render, get_object_or_404

from menu.models import Category, FoodItem
from vendor.models import Vendor


# Create your views here.
def marketplace(request):
    vendors = Vendor.objects.filter(is_approved=True)
    vendor_count = vendors.count()
    context = {
        'vendors': vendors,
        'vendor_count': vendor_count,
    }
    return render(request, 'marketplace/listings.html', context)


def vendor_detail(request, vendor_slug):
    vendor = get_object_or_404(Vendor, vendor_slug=vendor_slug)
    categories = Category.objects.filter(vendor=vendor).prefetch_related(
        Prefetch(
            'fooditems',
            queryset=FoodItem.objects.filter(is_available=True)
        )
    )
    context = {
        'vendor': vendor,
        'categories': categories,
    }
    return render(request, 'marketplace/vendor_detail.html', context)
