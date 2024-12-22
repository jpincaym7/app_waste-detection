from datetime import datetime
from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict, Optional, Union

from django.views.generic import TemplateView
from django.views import View
from django.http import JsonResponse
from django.db.models import Q, QuerySet
from django.conf import settings

from apps.recycling_points.models import RecyclingPoint
from apps.waste.models import WasteCategory

class RecyclingMapView(TemplateView):
    """View for rendering the recycling points map page."""
    
    template_name = 'explore.html'
    
    def get_context_data(self, **kwargs) -> Dict:
        """Add API URL to template context."""
        context = super().get_context_data(**kwargs)
        context['recycling_points_api_url'] = self.request.build_absolute_uri('/recycling_points/api/recycling-points/')
        print(context)
        context['maptiler_key'] = "eOJz2rYdmVnQEiFjpgcP"
        return context

class RecyclingPointsAPIView(View):
    def get(self, request) -> JsonResponse:
        try:
            # Get all active recycling points
            points = RecyclingPoint.objects.filter(is_active=True)
            
            # Format points for response
            formatted_points = []
            for point in points:
                if point.latitude and point.longitude:
                    formatted_points.append({
                        'id': point.id,
                        'name': point.name,
                        'latitude': float(point.latitude),
                        'longitude': float(point.longitude),
                        'address': point.address,
                        'waste_types': list(point.accepted_categories.values_list('name', flat=True)),
                        'contact_info': point.contact_info,
                        'opening_hours': point.opening_hours.get(datetime.now().strftime('%A').lower(), 'closed')
                    })

            return JsonResponse(formatted_points, safe=False)

        except Exception as e:
            return JsonResponse({
                'error': 'An error occurred while retrieving recycling points',
                'details': str(e)
            }, status=500)