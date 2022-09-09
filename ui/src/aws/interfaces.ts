export interface Resource {
    readonly rt: string         // resource type (lambda, ec2)
    readonly rn: string         // resource name
    readonly rg: string         // region
    readonly pr: string         // profile
}

export interface Page {
    readonly rn: string         // Page name
    readonly url: string        // Page url
    readonly last?: boolean      // last in list
}

export type PageOrResource = Page | Resource;

export function isResource(option: PageOrResource) {
    return "rt" in option;
}

export interface IndexInfo {
    fileName: string
    profiles: Array<string>
    regions: Array<string>
    totalNames: number
}