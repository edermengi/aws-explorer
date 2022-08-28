import datetime
import functools
from dataclasses import dataclass
from enum import Enum
from typing import Iterator

import boto3


class ResourceTypes(str, Enum):
    LAMBDA = 'lambda'
    LOG_GROUP = 'loggroup'
    SECRET = 'secret'
    BUCKET = 'bucket'
    DYNAMODB = 'dynamodb'
    RDS_CLUSTER = 'rds-cluster'
    RDS_DB = 'rds-db'
    EC2 = 'ec2'
    SECURITY_GROUP = 'security-group'
    ELB = 'elb'
    ELB_V2 = 'elb-v2'
    SQS = 'sqs'
    SNS = 'sns'


@dataclass
class Resource:
    type: ResourceTypes
    name: str


@functools.cache
def aws_client(client: str):
    return boto3.client(client)


class Timelog:
    def __init__(self, res_tye: str):
        self.res_tye = res_tye
        self.start = datetime.datetime.now().timestamp()
        self.count = 0

    def tick(self):
        self.count += 1
        if not self.count % 1000:
            print(f'Retrieved {self.count} {self.res_tye}s so far...')

    def end(self):
        end = datetime.datetime.now().timestamp()
        print(f'Retrieved {self.count} {self.res_tye}s in {end - self.start}s')


class ResourceProvider:

    def __init__(self,
                 res_type: ResourceTypes,
                 client: str,
                 list_func: str,
                 token_req: str,
                 token_resp: str,
                 items_prop: str,
                 name_prop
                 ):
        self.res_type = res_type
        self.name_prop = name_prop
        self.items_prop = items_prop
        self.token_resp = token_resp
        self.token_req = token_req
        self.list_func = list_func
        self.client = aws_client(client)

    def resources(self) -> Iterator[Resource]:
        timelog = Timelog(self.res_type)
        token = None
        while True:
            req = {self.token_req: token} if token else {}
            list_function = getattr(self.client, self.list_func)
            resp = list_function(**req)
            for item in resp[self.items_prop]:
                timelog.tick()
                yield Resource(self.res_type, self.extract_name(item))
            token = resp.get(self.token_resp)
            if not token:
                timelog.end()
                break

    def extract_name(self, item):
        if callable(self.name_prop):
            return self.name_prop(item)
        else:
            return item if isinstance(item, str) else item[self.name_prop]


class LambdaProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.LAMBDA,
                         'lambda',
                         'list_functions',
                         'Marker',
                         'NextMarker',
                         'Functions',
                         'FunctionName')


class LoggroupProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.LOG_GROUP,
                         'logs',
                         'describe_log_groups',
                         'nextToken',
                         'nextToken',
                         'logGroups',
                         'logGroupName')


class SecretsProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.SECRET,
                         'secretsmanager',
                         'list_secrets',
                         'NextToken',
                         'NextToken',
                         'SecretList',
                         'Name')


class S3Provider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.BUCKET,
                         's3',
                         'list_buckets',
                         'None',
                         'None',
                         'Buckets',
                         'Name')


class DynamodbProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.DYNAMODB,
                         'dynamodb',
                         'list_tables',
                         'ExclusiveStartTableName',
                         'LastEvaluatedTableName',
                         'TableNames',
                         '')


class RdsClusterProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.RDS_CLUSTER,
                         'rds',
                         'describe_db_clusters',
                         'Marker',
                         'Marker',
                         'DBClusters',
                         'DBClusterIdentifier')


class RdsDbInstanceProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.RDS_DB,
                         'rds',
                         'describe_db_instances',
                         'Marker',
                         'Marker',
                         'DBInstances',
                         'DBInstanceIdentifier')


class SecurityGroupProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.SECURITY_GROUP,
                         'ec2',
                         'describe_security_groups',
                         'NextToken',
                         'NextToken',
                         'SecurityGroups',
                         lambda item: item['GroupId'] + "," + item["GroupName"])


class ElbProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.ELB,
                         'elb',
                         'describe_load_balancers',
                         'Marker',
                         'NextMarker',
                         'LoadBalancerDescriptions',
                         'LoadBalancerName')


class Elb2Provider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.ELB_V2,
                         'elbv2',
                         'describe_load_balancers',
                         'Marker',
                         'NextMarker',
                         'LoadBalancers',
                         'LoadBalancerName')


class SqsProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.SQS,
                         'sqs',
                         'list_queues',
                         'NextToken',
                         'NextToken',
                         'QueueUrls',
                         lambda item: item[item.rfind('/') + 1:])


class SnsProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.SNS,
                         'sns',
                         'list_topics',
                         'NextToken',
                         'NextToken',
                         'Topics',
                         lambda item: item['TopicArn'][item['TopicArn'].rfind(':') + 1:])


PROVIDER_CLASSES = [cls for cls in ResourceProvider.__subclasses__()]
