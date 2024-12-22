from django.conf import settings
from django.http import Http404
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.urls import reverse_lazy
from django.views.generic import DetailView, UpdateView, View
from django.utils.translation import gettext_lazy as _
from torch import layout
from apps.security.forms.auth import UserRegistrationForm
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from apps.security.forms.profileForm import UserProfileForm
from apps.security.models import User
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from PIL import Image
import io
import uuid

def validate_profile_image(image):
    """
    Valida la imagen de perfil
    """
    # Validar tamaño máximo (5MB)
    if image.size > 5 * 1024 * 1024:
        raise ValidationError('La imagen no debe superar 5MB')
    
    # Validar formato
    valid_formats = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
    if image.content_type not in valid_formats:
        raise ValidationError('Formato no válido. Use JPEG, PNG, GIF o WEBP')
    
    return True

def process_profile_image(image_file):
    """
    Procesa y guarda la imagen de perfil
    """
    try:
        # Validar imagen
        validate_profile_image(image_file)
        
        # Abrir imagen con Pillow
        img = Image.open(image_file)
        
        # Convertir a RGB si es necesario
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')
        
        # Redimensionar manteniendo proporción
        max_size = (400, 400)
        img.thumbnail(max_size, Image.LANCZOS)
        
        # Guardar imagen procesada
        output = io.BytesIO()
        
        # Determinar formato de salida
        save_format = 'JPEG'
        if image_file.content_type == 'image/png':
            save_format = 'PNG'
        
        # Guardar al buffer
        img.save(output, format=save_format, quality=85)
        output.seek(0)
        
        # Generar nombre único
        ext = '.jpg' if save_format == 'JPEG' else '.png'
        unique_filename = f"profile_pictures/{uuid.uuid4()}{ext}"
        
        # Guardar en B2
        saved_path = default_storage.save(unique_filename, output)
        
        return saved_path
        
    except Exception as e:
        raise ValidationError(f'Error procesando la imagen: {str(e)}')

class LoginView(View):
    template_name = 'security/auth/login.html'
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        return render(request, self.template_name)
    
    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        user = authenticate(email=email, password=password)
        if user is not None:
            login(request, user)
            user.increment_login_count(request.META.get('REMOTE_ADDR'))
            messages.success(request, _('¡Bienvenido de nuevo!'))
            return redirect('home')
        else:
            messages.error(request, _('Correo electrónico o contraseña incorrectos'))
            return render(request, self.template_name)

class RegisterView(View):
    template_name = 'security/auth/register.html'
    form_class = UserRegistrationForm
    
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = self.form_class()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, _('¡Cuenta creada exitosamente!'))
            return redirect('home')
        return render(request, self.template_name, {'form': form})
    
class ProfileView(LoginRequiredMixin, DetailView):
    """
    View for displaying user profile information.
    """
    model = User
    template_name = 'security/auth/profile.html'
    context_object_name = 'profile_user'

    def get_object(self, queryset=None):
        """
        Get the user profile to display. If a username is provided in the URL,
        show that user's profile (if public). Otherwise, show the current user's profile.
        """
        if self.kwargs.get('username'):
            user = self.model.objects.filter(username=self.kwargs['username']).first()
            if user and user.privacy_settings.get('public_profile', False):
                return user
            raise Http404(_("Profile not found or is private"))
        return self.request.user

    def get_context_data(self, **kwargs):
        """Add additional context data for the template."""
        context = super().get_context_data(**kwargs)
        user = self.get_object()
        
        # Add impact metrics and other relevant data
        context.update({
            'impact_metrics': user.get_impact_metrics(),
            'total_points': user.get_total_points(),
            'active_badges': user.get_active_badges(),
            'is_own_profile': user == self.request.user,
        })
        
        return context

class ProfileUpdateView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = UserProfileForm
    template_name = 'security/auth/profile_edit.html'
    success_url = reverse_lazy('security:profile')
    
    def get_object(self, queryset=None):
        return self.request.user
    
    def form_valid(self, form):
        try:
            # Manejar la imagen de perfil si se proporciona una nueva
            if 'avatar' in self.request.FILES:
                # Borrar imagen anterior si existe
                if self.request.user.avatar:
                    default_storage.delete(self.request.user.avatar.name)
                
                # Procesar y guardar nueva imagen
                avatar_path = process_profile_image(self.request.FILES['avatar'])
                form.instance.avatar = avatar_path
            
            response = super().form_valid(form)
            messages.success(self.request, 'Perfil actualizado exitosamente.')
            return response
            
        except ValidationError as e:
            messages.error(self.request, str(e))
            return super().form_invalid(form)
        
    def form_invalid(self, form):
        messages.error(self.request, 'Por favor corrige los errores en el formulario.')
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Actualizar Perfil'
        context['user_points'] = self.request.user.get_total_points()
        context['active_badges'] = self.request.user.get_active_badges()
        return context
    
class LogoutView(View):
    def post(self, request):
        logout(request)  # Termina la sesión del usuario
        messages.success(request, 'Has cerrado sesión exitosamente.')
        return redirect('security:login')