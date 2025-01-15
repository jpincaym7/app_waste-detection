from django.urls import path
from apps.waste.views.capture import  UpdateProgressView, WasteDetectionView

app_name = 'waste'

urlpatterns = [
    path('capture/', WasteDetectionView.as_view(), name="capture"),
    path('api/update-progress/', UpdateProgressView.as_view(), name='update_progress'),
]
