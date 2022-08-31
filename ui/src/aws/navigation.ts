import {Resource} from "./interfaces";

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
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#SecurityGroup:groupId=${r.rn.split(',')[0]}`;
        case 'elb':
        case 'elb-v2':
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#LoadBalancers:search=${r.rn};sort=loadBalancerName`;
        case 'sqs':
            return `https://${r.rg}.console.aws.amazon.com/sqs/v2/home?region=${r.rg}#/queues/${encodeURIComponent(r.rn)}`;
        case 'sns':
            return `https://${r.rg}.console.aws.amazon.com/sns/v3/home?region=${r.rg}#/topics`;
    }
    return ``;
}

function navigateToResource(r: Resource) {
    window.open(makeAwsUrl(r), '_blank')?.focus();
}

export {
    navigateToResource
};