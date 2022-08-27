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
                 name_prop: str
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
                yield Resource(self.res_type, item[self.name_prop])
            token = resp.get(self.token_resp)
            if not token:
                timelog.end()
                break


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


PROVIDER_CLASSES = [SecretsProvider, LambdaProvider, LoggroupProvider]
