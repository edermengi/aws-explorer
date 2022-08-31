import argparse
import csv
import datetime
import functools
from dataclasses import asdict
from dataclasses import dataclass
from enum import Enum
from typing import Iterator, List, Type

import boto3


@dataclass
class Settings:
    profile: str
    region: str


_settings: Settings = Settings('', '')


def configure(pr: str, rg: str):
    _settings.profile = pr
    _settings.region = rg


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
    API = 'api'
    API_V2 = 'api-v2'

    @classmethod
    def list(cls):
        return list(map(lambda c: c.value, cls))


@dataclass
class Resource:
    profile: str
    region: str
    type: ResourceTypes
    name: str


@functools.cache
def session(profile_name: str):
    return boto3.Session(profile_name=profile_name)


@functools.cache
def aws_client(client: str, profile_name: str, region_name: str):
    return session(profile_name).client(client, region_name=region_name)


class ProgressLog:
    def __init__(self, res_tye: str):
        self.res_type = res_tye
        self.start = datetime.datetime.now().timestamp()
        self.count = 0

    def tick(self):
        self.count += 1
        if not self.count % 1000:
            print(f'Retrieved {self.count} {self.res_type} names so far...')

    def end(self):
        elapsed = datetime.datetime.now().timestamp() - self.start
        print(f'Retrieved {self.count} {self.res_type} names in {elapsed:.2f}s')


class ResourceProvider:
    is_aws_global = False

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
        self.profile = _settings.profile
        self.region = _settings.region
        self.client = aws_client(client, self.profile, self.region)

    def resources(self) -> Iterator[Resource]:
        progress = ProgressLog(self.res_type)
        token = None
        while True:
            req = {self.token_req: token} if token else {}
            list_function = getattr(self.client, self.list_func)
            resp = list_function(**req)
            for item in resp.get(self.items_prop) or []:
                progress.tick()
                yield Resource(self.profile, self.region, self.res_type, self.extract_name(item))
            token = resp.get(self.token_resp)
            if not token:
                progress.end()
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
    is_aws_global = True

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


class RestApiProvider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.API,
                         'apigateway',
                         'get_rest_apis',
                         'position',
                         'position',
                         'items',
                         lambda item: item['id'] + "," + item['name'])


class ApiGatewayV2Provider(ResourceProvider):
    def __init__(self):
        super().__init__(ResourceTypes.API_V2,
                         'apigatewayv2',
                         'get_apis',
                         'NextToken',
                         'NextToken',
                         'Items',
                         lambda item: item['ApiId'] + "," + item['Name'])


def _all_providers() -> List[Type[ResourceProvider]]:
    return [cls for cls in ResourceProvider.__subclasses__()]


def _parse_args():
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--profiles', type=str, required=True, nargs='+')
    parser.add_argument('--regions', type=str, required=True, nargs='+')
    parser.add_argument('--output-file', type=str, required=True)
    parser.add_argument('--types', type=str, required=False, choices=ResourceTypes.list(), nargs='+')
    return parser.parse_args()


if __name__ == '__main__':
    args = _parse_args()
    profiles = args.profiles
    regions = args.regions
    types = args.types
    output_file = args.output_file

    with open(output_file, 'w', newline='') as f:
        fieldnames = ['profile', 'region', 'type', 'name']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        for profile in profiles:
            for rno, region in enumerate(regions):
                print(f'Processing AWS profile [{profile}] and region [{region}]')
                configure(profile, region)

                for provider_class in _all_providers():
                    # include global resource into the first region file
                    if rno and provider_class.is_aws_global:
                        continue
                    # noinspection PyArgumentList
                    provider = provider_class()
                    if types and provider.res_type not in types:
                        continue
                    for res in provider.resources():
                        writer.writerow(asdict(res))
