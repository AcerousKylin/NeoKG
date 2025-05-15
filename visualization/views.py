import json
import os

from django.http import JsonResponse
from rest_framework import viewsets

from NeoKG import settings
from .models import NEIC, IPC, Patent, Service, Institution, Policy
from .serializers import (
    NEICSerializer, IPCSerializer, PatentSerializer,
    ServiceSerializer, InstitutionSerializer, PolicySerializer
)
from .utils import cypher_result_resolver, search_cypher_builder
from django.shortcuts import render
from neomodel import db


# Unified ViewSet of different types of nodes
class BaseNeoNodeViewSet(viewsets.ModelViewSet):
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.nodes

class NEICViewSet(BaseNeoNodeViewSet):
    model = NEIC
    serializer_class = NEICSerializer


class IPCViewSet(BaseNeoNodeViewSet):
    model = IPC
    serializer_class = IPCSerializer


class PatentViewSet(BaseNeoNodeViewSet):
    model = Patent
    serializer_class = PatentSerializer


class ServiceViewSet(BaseNeoNodeViewSet):
    model = Service
    serializer_class = ServiceSerializer


class InstitutionViewSet(BaseNeoNodeViewSet):
    model = Institution
    serializer_class = InstitutionSerializer


class PolicyViewSet(BaseNeoNodeViewSet):
    model = Policy
    serializer_class = PolicySerializer


def index(request):
    """
    首页视图，加载 index.html 模板。
    """
    return render(request, 'visualization/index.html')

def about(request):
    """
    关于页面视图，加载 about.html 模板。
    """
    return render(request, 'visualization/about.html')

def graph_page(request):
    """
    Render graph visualization page
    :param request: page request
    :return: rendered page
    """
    context = {
        'nodes': '[]',
        'links': '[]',
        'categories': '[]'
    }
    return render(request, 'visualization/graph.html', context)

def api_response(nodes, links, categories):
    return JsonResponse({
        'nodes': nodes,
        'links': links,
        'categories': categories,
    })

def graph_api(request):
    """
    JSON API of graph visualization data
    :param request: page request
    :return: graph visualization data
    """
    initial_query = """
    MATCH path=(n)-[r]->(m)
    RETURN nodes(path) AS nodes, relationships(path) AS relationships
    LIMIT 100
    """
    results, _ = db.cypher_query(initial_query)
    nodes, links, categories = cypher_result_resolver(results)
    return api_response(nodes, links, categories)

def search(request):
    """
    Query certain data specified by keyword, level and direction
    :param request: page request
    :return: search resulting data
    """
    keyword = request.GET.get('keyword', '').strip()
    if not keyword:
        return JsonResponse({'error': '请输入搜索关键词'}, status=400)
    try:
        level = int(request.GET.get('level', 1))
    except ValueError:
        level = 1
    direction = request.GET.get('direction', 'out')
    if direction not in ['out', 'in', 'both']:
        direction = 'out'

    query = search_cypher_builder(keyword, level, direction)
    results, _ = db.cypher_query(query)
    nodes, links, categories = cypher_result_resolver(results)

    if not nodes:
        return JsonResponse({'error': '未找到相关数据，显示初始数据'}, status=404)
    else:
        return api_response(nodes, links, categories)

def wordcloud_page(request):
    """
    Render word cloud page
    :param request: page request
    :return: rendered page
    """
    context = {
        'name': '',
        'value': ''
    }
    return render(request, 'visualization/wordCloud.html', context=context)

def wordcloud_api(request):
    json_file_path = os.path.join(settings.BASE_DIR, "static", "data", "keywords.json")

    try:
        # 读取 JSON 文件
        with open(json_file_path, "r", encoding="gbk") as file:
            wordcloud_data = json.load(file)
        return JsonResponse(wordcloud_data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "关键词数据文件未找到"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "关键词数据解析错误"}, status=500)