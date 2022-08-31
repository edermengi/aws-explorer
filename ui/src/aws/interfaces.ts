export interface Resource {
    readonly rt: string         // resource type (lambda, ec2)
    readonly rn: string         // resource name
    readonly rg: string         // region
    readonly pr: string         // profile
}
