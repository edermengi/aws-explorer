export interface Resource {
    readonly rt: string         // resource type (lambda, ec2)
    readonly rn: string         // resource name
    readonly rg: string         // region
    readonly pr: string         // profile
}

export interface IndexInfo {
    fileName: string
    profiles: Array<string>
    regions: Array<string>
    totalNames: number
}