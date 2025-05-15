import neo4j.graph
from neomodel import config
from django.conf import settings

def init_neomodel():
    config.DATABASE_URL = settings.NEOMODEL_NEO4J_BOLT_URL

def node_name_getter(node: neo4j.graph.Node):
    """
    Mapping a display name from all the raw nodes
    :param node: a neo4j.graph.Node type node data
    :return: key of the display property for every type of node
    """
    name_properties = ['IPC说明', '名称', '发明名称',
                       '服务名称', '机构名称', '标题']
    for name_property in name_properties:
        if name_property in node:
            return node[name_property]
    return 'Unknown'

def cypher_result_resolver(results):
    """
    Views Function: Process Cypher MATCH result into ECharts format
    :param results: a length-unknown tuple of specific Cypher MATCH result
    :return: a tuple of formatted nodes, links and node category list
    """
    nodes = []
    links = []
    categories = set()
    node_set = set()

    for path in results:
        raw_nodes = path[0]
        raw_relationships = path[1]

        for node in raw_nodes:
            if node.id not in node_set:
                node_labels = list(node.labels)
                category = node_labels[0] if node_labels else 'Unknown'

                node_properties = {}
                raw_node_properties = node.items()
                for prop in raw_node_properties:
                    node_properties[prop[0]] = prop[1]

                nodes.append({
                    'id': node.id,
                    'name': node_name_getter(node),
                    'category': node_labels[0] if node_labels else 'Unknown',
                    'properties': node_properties,
                })
                node_set.add(node.id)
                categories.add(category)

        for relationship in raw_relationships:
            links.append({
                'source': str(relationship.start_node.id),
                'target': str(relationship.end_node.id),
                'name': relationship.type
            })

    categories = [{'id': idx, 'name': category} for idx, category in enumerate(categories)]
    for node in nodes:
        for cat in categories:
            if node['category'] == cat['name']:
                node['category'] = cat['id']
                break
    return nodes, links, categories

def search_cypher_builder(keyword, level, direction):
    """
    Construct a Cypher for multiple level and direction based search
    :param keyword: anything can user use to find nodes
    :param level: number of related layer from keyword node
    :param direction: direction of relation between result nodes
    :return: a ready Cypher string
    """
    keyword = keyword.replace('"', '\\"')   # injection prohibition

    direction_clauses_map = {
        'out': '-[r*1..{}]->',
        'in': '<-[r*1..{}]-',
        'both': '-[r*1..{}]-'
    }

    relationship_pattern_template = direction_clauses_map.get(direction)
    if not relationship_pattern_template:   # Missing value prohibition
        relationship_pattern_template = direction_clauses_map['both']
    relationship_pattern = relationship_pattern_template.format(level)

    return f"""
        MATCH (source)
        WHERE ANY (
            prop IN keys(source)
            WHERE toString(source[prop]) CONTAINS "{keyword}"
        )
        MATCH path=(source){relationship_pattern}(target)
        RETURN nodes(path) AS nodes, relationships(path) AS relationships
    """