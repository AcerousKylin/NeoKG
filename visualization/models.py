from NeoKG.settings import NEO4J_CONFIG
from neomodel import StructuredNode, StringProperty, RelationshipTo, config

config.DATABASE_URL = 'neo4j+s://{}:{}@{}'.format(
    NEO4J_CONFIG['USERNAME'], NEO4J_CONFIG['PASSWORD'], NEO4J_CONFIG['URI'] )

class NEIC(StructuredNode):
    neic_code = StringProperty(unique_index=True ,db_property="代码")
    neic_title = StringProperty(db_property="名称")
    neic_desc = StringProperty(db_property="说明")

    @property
    def properties(self) -> dict:
        return {
            'neic_code': self.neic_code,
            'neic_title': self.neic_title,
            'neic_desc': self.neic_desc
        }

    subdivide_into = RelationshipTo("NEIC", "SUBDIVIDE_INTO")
    categorized_as = RelationshipTo("NEIC", "CATEGORIZED_AS")

    @property
    def relationships(self) -> dict:
        return {
            'subdivide_into': self.subdivide_into,
            'categorized_as': self.categorized_as,
        }

class IPC(StructuredNode):
    ipc_code = StringProperty(unique_index=True ,db_property="IPC分类号")
    ipc_desc = StringProperty(db_property="IPC说明")

    subdivide_into = RelationshipTo("IPC", "SUBDIVIDE_INTO")
    categorized_as = RelationshipTo("IPC", "CATEGORIZED_AS")

class Patent(StructuredNode):
    application_number = StringProperty(unique_index=True ,db_property="申请号")
    patent_name = StringProperty(db_property="发明名称")
    doc_type = StringProperty(db_property="文献类型")
    applicant = StringProperty(db_property="申请（专利权）人")
    inventor = StringProperty(db_property="发明人")
    ipc_cpc_code = StringProperty(db_property="IPC分类号")
    abstract = StringProperty(db_property="摘要")

    classified_as = RelationshipTo("IPC", "CLASSIFIED_AS")

class Service(StructuredNode):
    service_name = StringProperty(unique_index=True, db_property="服务名称")

    belong_to = RelationshipTo("NEIC", "BELONG_TO")

class Institution(StructuredNode):
    institution_name = StringProperty(unique_index=True, db_property="机构名称")
    institution_type = StringProperty(db_property="机构类型")
    establish_in = StringProperty(db_property="成立年份")
    locate_at = StringProperty(db_property="机构所在地")
    registration_authority = StringProperty(db_property="登记机关")

    apply = RelationshipTo("Patent", "APPLY")
    agency_of = RelationshipTo("Patent", "AGENCY_OF")

class Policy(StructuredNode):
    doc_code = StringProperty(db_property="发文字号")
    policy_title = StringProperty(db_property="标题")
    doc_issuing_agency = StringProperty(db_property="发文机关")
    topic_class = StringProperty(db_property="主题分类")
    doc_class = StringProperty(db_property="公文种类")
    doc_link = StringProperty(db_property="相关链接")
    doc_attachment = StringProperty(db_property="附件")
    specified_location = StringProperty(db_property="特指地区")
    specified_institution = StringProperty(db_property="特指机构")

    involve_i = RelationshipTo("Institution", "INVOLVE")
    involve_s = RelationshipTo("Service", "INVOLVE")
