from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv
from pathlib import Path
import boto3
from botocore.config import Config
# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'your-default-secret-key-for-dev')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

USE_S3 = os.getenv('USE_S3', 'False') == 'True'

# Allowed hosts should be set from environment variable
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,web-production-558dc.up.railway.app').split(',')

CSRF_TRUSTED_ORIGINS = [
    'https://web-production-558dc.up.railway.app'
]

# Update CORS settings to use only HTTPS in production
CORS_ALLOWED_ORIGINS = [
    'https://web-production-558dc.up.railway.app',
    'http://localhost:3000',  # Keep for local development
    'http://localhost:8000',  # Keep for local development
]

# Security settings adjustments
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'whitenoise.runserver_nostatic',
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg',
    'django_filters',
    'storages',
    'corsheaders',
    'django_backblaze_b2',
    
    # Local apps
    'apps.security',
    'apps.waste',
    'apps.waste_history',
    'apps.recycling_points',
    'apps.gamification',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Whitenoise should be after SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Security settings
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

ROOT_URLCONF = 'waste_detection.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'waste_detection.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# Cache settings (using Railway Redis if available)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
    }
}


# Rest Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://web-production-558dc.up.railway.app',
    'http://localhost:3000',
    'http://localhost:8000',
]
CORS_ALLOW_CREDENTIALS = True


if USE_S3:
    AWS_DEFAULT_ACL = None
    # AWS Settings
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_QUERYSTRING_AUTH = False
    
    # S3 Static Settings
    STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
    STATIC_LOCATION = 'static'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{STATIC_LOCATION}/'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

    # S3 Media Settings
    MEDIA_LOCATION = 'media'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIA_LOCATION}/'
    DEFAULT_FILE_STORAGE = 'waste_detection.storage_backends.MediaStorage'


    # S3 CORS Configuration
    AWS_S3_CORS_CONFIGURATION = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
            'AllowedOrigins': CORS_ALLOWED_ORIGINS,
            'ExposeHeaders': ['ETag'],
            'MaxAgeSeconds': 3000
        }]
    }

    # Optional: S3 Security Settings
    AWS_S3_SECURE_URLS = True
    AWS_S3_ENCRYPTION = True
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    
    # Configure boto3 to use the specified region
    boto3_config = Config(
        region_name=AWS_S3_REGION_NAME,
        signature_version=AWS_S3_SIGNATURE_VERSION,
    )
else:
    # Use default static/media settings for local development
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'apps.waste': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}

# Custom user model
AUTH_USER_MODEL = 'security.User'

# Authentication URLs
LOGIN_URL = '/security/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_URL = '/security/logout/'
LOGOUT_REDIRECT_URL = '/'

STATIC_VIDEO_URL = '/static/videos/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'