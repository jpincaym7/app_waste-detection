"""
URL configuration for waste_detection project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os
from django.contrib import admin
from django.urls import include, path
from waste_detection import settings
from django.conf.urls.static import static
from apps.waste.views.home import HomeView
from django.views.generic.base import RedirectView
import requests
from django.http import HttpResponse, Http404
from django.views.decorators.cache import cache_control

@cache_control(max_age=0, no_cache=True, no_store=True, must_revalidate=True)
def service_worker(request):
    s3_url = "https://s3-srd-project.s3.us-east-2.amazonaws.com/js/sw.js"

    try:
        response = requests.get(s3_url)
        if response.status_code == 200:
            return HttpResponse(response.content, content_type="application/javascript")
        else:
            raise Http404("Service Worker not found on S3.")
    except requests.RequestException as e:
        raise Http404(f"Error fetching Service Worker: {e}")


urlpatterns = [
    path('admin/', admin.site.urls),
    path('waste/', include('apps.waste.urls', namespace='waste')),
    path('security/', include('apps.security.urls', namespace='security')),
    path('recycling_points/', include('apps.recycling_points.urls', namespace='recycling_points')),
    path('gamification/', include('apps.gamification.urls', namespace='gamification')),
    path("", HomeView.as_view(), name="home"),
    path('favicon.ico', RedirectView.as_view(url='https://s3-srd-project.s3.us-east-2.amazonaws.com/img/favicon.ico')),
    path('service-worker.js', service_worker, name='service_worker'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
