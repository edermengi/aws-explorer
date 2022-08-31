import argparse
import csv
import datetime
import functools
from dataclasses import asdict
from dataclasses import dataclass
from typing import Iterator, List

import boto3


@dataclass
class Settings:
    profile: str
    region: str


_settings: Settings = Settings('', '')


def configure(pr: str, rg: str):
    _settings.profile = pr
    _settings.region = rg


@dataclass
class Resource:
    profile: str
    region: str
    type: str
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
                 res_type: str,
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


# @formatter:off
_provider_args = [
    # res_type          client             list_function               req_token                    resp_token                  items                       name
    # _________        __________         _____________________       ___________                  _____________             ___________                 _______________
    ('lambda',         'lambda',          'list_functions',           'Marker',                   'NextMarker',             'Functions',                 'FunctionName'),
    ('loggroup',       'logs',            'describe_log_groups',      'nextToken',                'nextToken',              'logGroups',                 'logGroupName'),
    ('secret',         'secretsmanager',  'list_secrets',             'NextToken',                'NextToken',              'SecretList',                'Name'),
    ('bucket',         's3',              'list_buckets',             'None',                     'None',                   'Buckets',                   'Name'),
    ('dynamodb',       'dynamodb',        'list_tables',              'ExclusiveStartTableName',  'LastEvaluatedTableName', 'TableNames',                ''),
    ('rds-cluster',    'rds',             'describe_db_clusters',     'Marker',                   'Marker',                 'DBClusters',                'DBClusterIdentifier'),
    ('rds-db',         'rds',             'describe_db_instances',    'Marker',                   'Marker',                 'DBInstances',               'DBInstanceIdentifier'),
    ('security-group', 'ec2',             'describe_security_groups', 'NextToken',                'NextToken',              'SecurityGroups',            lambda item: item['GroupId'] + "," + item["GroupName"]),
    ('elb',            'elb',             'describe_load_balancers',  'Marker',                   'NextMarker',             'LoadBalancerDescriptions',  'LoadBalancerName'),
    ('elbv2',          'elbv2',           'describe_load_balancers',  'Marker',                   'NextMarker',             'LoadBalancers',             'LoadBalancerName'),
    ('sqs',            'sqs',             'list_queues',              'NextToken',                'NextToken',              'QueueUrls',                 lambda item: item[item.rfind('/') + 1:]),
    ('sns',            'sns',             'list_topics',              'NextToken',                'NextToken',              'Topics',                    lambda item: item['TopicArn'][item['TopicArn'].rfind(':') + 1:]),
    ('api',            'apigateway',      'get_rest_apis',            'position',                 'position',               'items',                     lambda item: item['id'] + "," + item['name']),
    ('api-v2',         'apigatewayv2',    'get_apis',                 'NextToken',                'NextToken',              'Items',                     lambda item: item['ApiId'] + "," + item['Name'])
]
# @formatter:on


def _all_providers() -> List[ResourceProvider]:
    return [ResourceProvider(*_args) for _args in _provider_args]


def _parse_args():
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--profiles', type=str, required=True, nargs='+')
    parser.add_argument('--regions', type=str, required=True, nargs='+')
    parser.add_argument('--output-file', type=str, required=True)
    parser.add_argument('--types', type=str, required=False, nargs='+')
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

                for provider in _all_providers():
                    # include global resource into the first region file
                    if rno and provider.is_aws_global:
                        continue
                    # noinspection PyArgumentList
                    if types and provider.res_type not in types:
                        continue
                    for res in provider.resources():
                        writer.writerow(asdict(res))