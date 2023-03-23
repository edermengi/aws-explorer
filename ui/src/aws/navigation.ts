import {Page, Resource} from "./interfaces";

function makeAwsUrl(r: Resource | null): string {
    console.log(r);
    if (!r) return '';
    switch (r.rt) {
        case 'lambda':
            return `https://${r.rg}.console.aws.amazon.com/lambda/home?region=${r.rg}#/functions/${r.rn}`;
        case 'loggroup':
            return `https://${r.rg}.console.aws.amazon.com/cloudwatch/home?region=${r.rg}#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent(r.rn))}`;
        case 'secret':
            return `https://${r.rg}.console.aws.amazon.com/secretsmanager/secret?name=${r.rn}&region=${r.rg}`;
        case 'bucket':
            return `https://s3.console.aws.amazon.com/s3/buckets/${r.rn}?tab=objects`;
        case 'dynamodb':
            return `https://${r.rg}.console.aws.amazon.com/dynamodbv2/home?region=${r.rg}#item-explorer?initialTagKey=&maximize=true&table=${r.rn}`;
        case 'rds-cluster':
            return `https://${r.rg}.console.aws.amazon.com/rds/home?region=${r.rg}#database:id=${r.rn};is-cluster=true;tab=configuration`;
        case 'rds-db':
            return `https://${r.rg}.console.aws.amazon.com/rds/home?region=${r.rg}#database:id=${r.rn};is-cluster=false;tab=configuration`;
        case 'security-group':
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#SecurityGroup:groupId=${name0(r)}`;
        case 'elb':
        case 'elb-v2':
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#LoadBalancers:search=${r.rn};sort=loadBalancerName`;
        case 'sqs':
            return `https://${r.rg}.console.aws.amazon.com/sqs/v2/home?region=${r.rg}#/queues/${encodeURIComponent(r.rn)}`;
        case 'sns':
            return `https://${r.rg}.console.aws.amazon.com/sns/v3/home?region=${r.rg}#/topics`;
        case 'api':
            return `https://${r.rg}.console.aws.amazon.com/apigateway/home?region=${r.rg}#/apis/${name0(r)}/resources`;
        case 'api-v2':
            return `https://${r.rg}.console.aws.amazon.com/apigateway/home?region=${r.rg}#/apis/${name0(r)}/routes`;
        case 'web-acl':
            return `https://us-east-1.console.aws.amazon.com/wafv2/homev2/web-acl/${name0(r)}/${name1(r)}/overview?region=${r.rg}`;
        case 'waf-ip-set':
            return `https://us-east-1.console.aws.amazon.com/wafv2/homev2/ip-set/${name0(r)}/${name1(r)}?region=${r.rg}`;
        case 'codebuild':
            return `https://${r.rg}.console.aws.amazon.com/codesuite/codebuild/${name1(r)}/projects/${name0(r)}/history?region=${r.rg}`;
        case 'codepipeline':
            return `https://${r.rg}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${r.rn}/view?region=${r.rg}`;
        case 'subnet':
            return `https://${r.rg}.console.aws.amazon.com/vpc/home?region=${r.rg}#SubnetDetails:subnetId=${name0(r)}`;
        case 'ec2':
            return `https://${r.rg}.console.aws.amazon.com/ec2/home?region=${r.rg}#InstanceDetails:instanceId=${name0(r)}`;
        case 'role':
            return `https://us-east-1.console.aws.amazon.com/iamv2/home?region=eu-west-1#/roles/details/${r.rn}?section=permissions`;
        case 'event-rule':
            return `https://${r.rg}.console.aws.amazon.com/events/home?region=${r.rg}#/eventbus/default/rules/${name0(r)}`;
    }
    return ``;
}

const name0 = (resource: Resource) => nameI(resource, 0);
const name1 = (resource: Resource) => nameI(resource, 1);

function nameI(resource: Resource, i: number) {
    return resource.rn.split(',')[i];
}

function navigateToResource(r: Resource) {
    window.open(makeAwsUrl(r), '_blank')?.focus();
}

function navigateToPage(p: Page) {
    window.open(p.url, '_blank')?.focus();
}

export {
    navigateToResource,
    navigateToPage
};