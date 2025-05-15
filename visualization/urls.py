from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'neic', views.NEICViewSet, basename='neic')
router.register(r'ipc', views.IPCViewSet,basename='ipc')
router.register(r'patent', views.PatentViewSet, basename='patent')
router.register(r'service', views.ServiceViewSet, basename='service')
router.register(r'institution', views.InstitutionViewSet, basename='institution')
router.register(r'policy', views.PolicyViewSet, basename='policy')

urlpatterns = [
    path('', views.index, name='index'),
    path('graph/', views.graph_page, name='graph'),
    path('graph/api/', views.graph_api, name='graph_api'),
    path('wordcloud/', views.wordcloud_page, name='wordcloud'),
    path('wordcloud/api/', views.wordcloud_api, name='wordcloud_api'),
    path('search/', views.search, name='search'),
    path('about/', views.about, name='about'),
    path('api/', include(router.urls)),
]
