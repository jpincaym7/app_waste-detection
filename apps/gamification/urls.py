from rest_framework_nested import routers
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from apps.gamification.views.api_trash import create_comment, get_comments, trash_report_detail_json, trash_report_edit, trash_report_list, EducationView, trash_report_update, trash_view, list_reports, trash_report_detail, trash_report_create, nearby_reports, change_report_status, add_comment

app_name = 'gamification'

urlpatterns = [
    path('reports/', trash_report_list, name='report-form'),
    path('reports/view/', trash_view, name="reports-view"),
    path('reports/list/', list_reports, name='report-json'),
    path('reports/create/', trash_report_create, name='report-create'),
    path('reports/edit/<int:pk>/', trash_report_edit, name='trash_report_edit'),
    path('reports/update/<int:pk>/', trash_report_update, name='trash_report_update'),
    path('reports/<int:pk>/', trash_report_detail_json, name='trash_report_detail_json'),
    path('reports/nearby/',nearby_reports, name='nearby-reports'),
    path('reports/<int:pk>/status/', change_report_status, name='change-status'),
    path('reports/<int:report_pk>/comments/', add_comment, name='add-comment'),
    path('education/', EducationView.as_view(), name='education'),
    path('api/reports/<int:report_pk>/comments/', get_comments, name='get-comments'),
    path('api/reports/<int:report_pk>/comments/create/', create_comment, name='create-comment'),
]
