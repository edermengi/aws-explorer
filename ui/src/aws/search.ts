// @ts-ignore
import Papa, {ParseResult, ParseStepResult} from "papaparse";
// @ts-ignore
import {Document} from 'flexsearch';

export interface Resource {
    readonly rt: string         // resource type (lambda, ec2)
    readonly rn: string         // resource name
    readonly rg: string         // region
}


export const resources: Object[] = [];

const index = new Document({
    tokenize: 'full',
    document: {
        id: 'id',
        store: true,
        index: [
            {
                field: "rt"
            },
            {
                field: "rn",
            }
        ],
        tag: "rg"
    }
});

function loadResources() {


    let i = 1;
    resources.length = 0;
    Papa.parse('/a-worldcheck-preprod-eu-west-1.local.csv', {
        download: true,
        step: function (row: ParseStepResult<Resource>) {
            // @ts-ignore
            const [resourceType, resourceName] = row.data;
            if (resourceName && resourceType) {
                resources.push({'label': resourceName, 'id': i++});
                // @ts-ignore
                index.add({id: i, rt: resourceType, rn: resourceName, rg: 'eu-west-1'});
            }
        },
        complete() {
            console.log("parsed:", i);
            console.log(index.search('test', {enrich: true, index: "rn", limit: 10}));
        }
    })
}


function doSearch(query: string): Resource[] {
    const response = index.search(query, 20, {enrich: true, index: "rn", limit: 20});
    if (response.length > 0) {
        const docs: Object[] = response[0].result;
        console.log('Found', docs.length, 'results for ', query);
        return docs.map((doc) => {
            // @ts-ignore
            return {rt: doc.doc.rt, rn: doc.doc.rn, rg: doc.doc.rg};
        });
    }
    return [];
}

export {
    doSearch,
    loadResources
};