from rest_framework import serializers
from .models import NEIC, IPC, Patent, Service, Institution, Policy

class NEICSerializer(serializers.ModelSerializer):
    class Meta:
        model = NEIC
        fields = '__all__'

class IPCSerializer(serializers.ModelSerializer):
    class Meta:
        model = IPC
        fields = '__all__'

class PatentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patent
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = '__all__'
