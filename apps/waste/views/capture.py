from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import logging
import base64
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.db import transaction
from django.db.models import F
from django.http import JsonResponse
from django.views import View
import json
from django.middleware.csrf import get_token

from apps.gamification.models import UserProfile

@method_decorator(ensure_csrf_cookie, name='dispatch')
class WasteDetectionView(LoginRequiredMixin, View):
    template_name = 'capture.html'
    
    def get(self, request):
        """Render the waste detection page with user's gamification data."""
        try:
            # Obtener el perfil del usuario
            profile = request.user.profile
            print(profile)
            context = {
                'user_stats': {
                    'points': profile.points,
                    'level': profile.level,
                    'total_detections': profile.total_detections,
                    'badges': profile.badges if profile.badges else [],
                }
            }
        except ObjectDoesNotExist:
            # Si el perfil no existe, crear uno nuevo con valores por defecto
            profile = UserProfile.objects.create(user=request.user)
            context = {
                'user_stats': {
                    'points': 0,
                    'level': 1,
                    'total_detections': 0,
                    'badges': [],
                }
            }

        return render(request, self.template_name, context)
    

class UpdateProgressView(LoginRequiredMixin, View):
    def get_csrf_token(self, request):
        return get_token(request)
    
    def post(self, request):
        try:
            # Verificar que el usuario está autenticado
            if not request.user.is_authenticated:
                return JsonResponse({
                    'success': False,
                    'error': 'Usuario no autenticado'
                }, status=401)

            # Decodificar el JSON del body
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({
                    'success': False,
                    'error': 'JSON inválido'
                }, status=400)

            points = data.get('points', 0)
            detections = data.get('detections', 0)

            # Validar los datos
            if not isinstance(points, (int, float)) or not isinstance(detections, (int, float)):
                return JsonResponse({
                    'success': False,
                    'error': 'Datos inválidos'
                }, status=400)

            with transaction.atomic():
                # Obtener o crear el perfil del usuario
                try:
                    profile = request.user.profile
                except ObjectDoesNotExist:
                    profile = UserProfile.objects.create(user=request.user)

                old_level = profile.level
                
                # Actualizar puntos y detecciones
                profile.points += points
                profile.total_detections += detections
                
                # Calcular nuevo nivel (100 puntos por nivel)
                new_level = (profile.points) // 100 + 1
                profile.level = new_level
                
                # Verificar nuevas insignias
                new_badges = []
                level_thresholds = {
                    5: 'recycling_master',
                    10: 'waste_warrior',
                    15: 'eco_champion',
                    20: 'environmental_hero'
                }
                
                if new_level > old_level:
                    badges_set = set(profile.badges if profile.badges else [])
                    for level, badge in level_thresholds.items():
                        if old_level < level <= new_level and badge not in badges_set:
                            if not profile.badges:
                                profile.badges = []
                            profile.badges.append(badge)
                            new_badges.append(badge)
                
                profile.save()
                
                return JsonResponse({
                    'success': True,
                    'points': profile.points,
                    'level': profile.level,
                    'total_detections': profile.total_detections,
                    'badges': profile.badges if profile.badges else [],
                    'new_level': new_level > old_level,
                    'new_badges': new_badges
                })
                
        except Exception as e:
            import traceback
            print(traceback.format_exc())  # Para debugging
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
