import math
import json
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.paginator import Paginator
from django.views.generic import TemplateView
from django.views.decorators.http import require_http_methods
from apps.gamification.models import TrashReport, ReportComment
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from PIL import Image
import io
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TrashReportImageHandler:
    def __init__(self):
        self.allowed_formats = {'image/jpeg', 'image/png', 'image/webp'}
        self.max_size = 10 * 1024 * 1024  # 10MB
        
    def process_and_save_image(self, image_file, user_id):
        """
        Procesa y guarda la imagen del reporte
        """
        try:
            # Validar imagen
            self.validate_image(image_file)
            
            # Abrir imagen con Pillow
            img = Image.open(image_file)
            
            # Convertir a RGB si es necesario
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Redimensionar si es muy grande
            max_dimension = 1920
            if max(img.size) > max_dimension:
                ratio = max_dimension / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.LANCZOS)
            
            # Preparar para guardar
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85)
            output.seek(0)
            
            # Generar nombre único
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"trash_reports/{user_id}/{timestamp}_{uuid.uuid4().hex[:8]}.jpg"
            
            # Guardar en B2
            saved_path = default_storage.save(filename, ContentFile(output.getvalue()))
            
            return saved_path
            
        except Exception as e:
            logger.error(f"Error processing report image: {str(e)}", exc_info=True)
            raise ValidationError(f"Error procesando la imagen: {str(e)}")
    
    def validate_image(self, image_file):
        """
        Valida el formato y tamaño de la imagen
        """
        if not hasattr(image_file, 'content_type'):
            raise ValidationError("Archivo de imagen inválido")
        
        if image_file.content_type not in self.allowed_formats:
            raise ValidationError(f"Formato no soportado. Use: {', '.join(self.allowed_formats)}")
        
        if image_file.size > self.max_size:
            raise ValidationError(f"La imagen excede el tamaño máximo de {self.max_size/1024/1024}MB")
        
        return True
    
    def delete_image(self, image_path):
        """
        Elimina una imagen del almacenamiento
        """
        try:
            if image_path:
                default_storage.delete(image_path)
                return True
        except Exception as e:
            logger.error(f"Error deleting image {image_path}: {str(e)}", exc_info=True)
            return False



def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on Earth."""
    R = 6371  # Radio de la Tierra en km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

@login_required
def trash_report_list(request):
    """Vista para listar todos los reportes de basura."""
    reports = TrashReport.objects.all().order_by('-created_at')
    # Filtrado por estado
    status_filter = request.GET.get('status')
    if status_filter:
        reports = reports.filter(status=status_filter)
    
    # Búsqueda por descripción
    search_query = request.GET.get('search')
    if search_query:
        reports = reports.filter(description__icontains=search_query)
    
    # Ordenamiento
    order_by = request.GET.get('order_by', '-created_at')
    if order_by in ['created_at', '-created_at', 'severity', '-severity']:
        reports = reports.order_by(order_by)
    
    # Paginación
    page_number = request.GET.get('page', 1)
    paginator = Paginator(reports, 10)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'severity_choices': TrashReport.SEVERITY_CHOICES,
        'current_status': status_filter,
        'search_query': search_query,
        'order_by': order_by,
    }
    context['maptiler_key'] = "eOJz2rYdmVnQEiFjpgcP"
    return render(request, 'report.html', context)

@login_required
def trash_view(request):
    """Vista para listar todos los reportes de basura."""
    reports = TrashReport.objects.all().order_by('-created_at')
    # Filtrado por estado
    status_filter = request.GET.get('status')
    if status_filter:
        reports = reports.filter(status=status_filter)
    
    # Búsqueda por descripción
    search_query = request.GET.get('search')
    if search_query:
        reports = reports.filter(description__icontains=search_query)
    
    # Ordenamiento
    order_by = request.GET.get('order_by', '-created_at')
    if order_by in ['created_at', '-created_at', 'severity', '-severity']:
        reports = reports.order_by(order_by)
    
    # Paginación
    page_number = request.GET.get('page', 1)
    paginator = Paginator(reports, 10)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'severity_choices': TrashReport.SEVERITY_CHOICES,
        'current_status': status_filter,
        'search_query': search_query,
        'order_by': order_by,
    }
    context['maptiler_key'] = "eOJz2rYdmVnQEiFjpgcP"
    return render(request, 'list_report.html', context)

@login_required
def list_reports(request):
    reports = TrashReport.objects.all()  # O puedes filtrar según la lógica que desees
    report_data = []
    
    for report in reports:
        report_data.append({
            'description': report.description,
            'location': report.longitude,  # Asegúrate de tener esta información en el modelo
            'severity': report.severity,
            'status': report.status,
            'image_url': report.image.url if report.image else '',  # Ajusta el campo de imagen
        })
    
    return JsonResponse(report_data, safe=False)

@login_required
def trash_report_detail(request, pk):
    """Vista para ver el detalle de un reporte específico."""
    report = get_object_or_404(TrashReport, pk=pk)
    comments = report.comments.all().order_by('-created_at')
    
    context = {
        'report': report,
        'comments': comments,
    }
    
    return render(request, 'trash_reports/detail.html', context)

@login_required
@require_http_methods(["POST"])
def trash_report_create(request):
    """Vista para crear un nuevo reporte."""
    image_handler = TrashReportImageHandler()
    
    try:
        # Validar que se haya enviado una imagen
        if 'image' not in request.FILES:
            return HttpResponseBadRequest('La imagen es requerida')
        
        # Procesar y guardar la imagen
        try:
            image_path = image_handler.process_and_save_image(
                request.FILES['image'],
                request.user.id
            )
        except ValidationError as e:
            return HttpResponseBadRequest(str(e))
        
        # Crear el reporte
        report = TrashReport.objects.create(
            user=request.user,
            latitude=request.POST.get('latitude'),
            longitude=request.POST.get('longitude'),
            image=image_path,
            description=request.POST.get('description'),
            severity=request.POST.get('severity'),
            is_recurring=request.POST.get('is_recurring') == 'true'
        )
        
        # Preparar respuesta con URL de la imagen
        response_data = {
            'id': report.id,
            'message': 'Reporte creado exitosamente',
            'image_url': default_storage.url(report.image.name)
        }
        
        # Si el reporte está cerca de otros existentes, incluir esa información
        nearby = TrashReport.objects.filter(
            latitude__range=(float(report.latitude) - 0.01, float(report.latitude) + 0.01),
            longitude__range=(float(report.longitude) - 0.01, float(report.longitude) + 0.01)
        ).exclude(id=report.id)
        
        if nearby.exists():
            response_data['nearby_reports'] = list(nearby.values('id', 'latitude', 'longitude'))
        
        return JsonResponse(response_data)
        
    except Exception as e:
        logger.error(f"Error creating trash report: {str(e)}", exc_info=True)
        # Si algo falla, intentar limpiar la imagen si se llegó a guardar
        if 'image_path' in locals():
            image_handler.delete_image(image_path)
        return HttpResponseBadRequest(f"Error creando el reporte: {str(e)}")

@login_required
@require_http_methods(["GET"])
def nearby_reports(request):
    """Vista para encontrar reportes cercanos a una ubicación."""
    try:
        lat = float(request.GET.get('lat'))
        lng = float(request.GET.get('lng'))
        radius = float(request.GET.get('radius', 5.0))
    except (TypeError, ValueError):
        return HttpResponseBadRequest('Parámetros de ubicación inválidos')

    reports = TrashReport.objects.all()
    nearby_reports = []

    for report in reports:
        distance = haversine(lat, lng, float(report.latitude), float(report.longitude))
        if distance <= radius:
            nearby_reports.append({
                'id': report.id,
                'latitude': float(report.latitude),
                'longitude': float(report.longitude),
                'description': report.description,
                'severity': report.severity,
                'status': report.status,
                'distance': round(distance, 2)
            })

    return JsonResponse({'reports': nearby_reports})

@login_required
@require_http_methods(["POST"])
def change_report_status(request, pk):
    """Vista para cambiar el estado de un reporte."""
    report = get_object_or_404(TrashReport, pk=pk)
    new_status = request.POST.get('status')
    
    if new_status not in dict(TrashReport.STATUS_CHOICES):
        return HttpResponseBadRequest('Estado inválido')
    
    report.status = new_status
    report.save()
    
    return JsonResponse({
        'id': report.id,
        'status': report.status,
        'message': 'Estado actualizado exitosamente'
    })

@login_required
@require_http_methods(["POST"])
def add_comment(request, report_pk):
    """Vista para agregar un comentario a un reporte."""
    report = get_object_or_404(TrashReport, pk=report_pk)
    content = request.POST.get('content')
    
    if not content:
        return HttpResponseBadRequest('El contenido del comentario es requerido')
    
    comment = ReportComment.objects.create(
        report=report,
        user=request.user,
        content=content
    )
    
    return JsonResponse({
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'user': comment.user.username
    })
    
class EducationView(TemplateView):
    template_name = 'education.html'