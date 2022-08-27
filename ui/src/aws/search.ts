// @ts-ignore
import Papa, {ParseResult, ParseStepResult} from "papaparse";
// @ts-ignore
import {Document} from 'flexsearch';

export interface Resource {
    readonly type: string
    readonly name: string
}


export const resources: Object[] = [];

const index = new Document({
    tokenize: 'full',
    document: {
        id: 'id',
        store: true,
        index: [
            {
                field: "resourceType"
            },
            {
                field: "resourceName",
            }
        ]
    }
});

function loadResources() {


    let i = 1;
    resources.length = 0;
    Papa.parse('/data.local.csv', {
        download: true,
        step: function (row: ParseStepResult<Resource>) {
            // @ts-ignore
            const [resourceType, resourceName] = row.data;
            if (resourceName && resourceType) {
                resources.push({'label': resourceName, 'id': i++});
                // @ts-ignore
                index.add({id: i, resourceType: resourceType, resourceName: resourceName});
            }
        },
        complete() {
            console.log("parsed:", i);
            console.log(index.search('lam', {enrich: true}));
        }
    })
}


function doSearch(query: string): Resource[] {
    const response = index.search(query, {enrich: true});
    if (response.length > 0) {
        const docs: Object[] = response[0].result;
        return docs.map((doc) => {
            // @ts-ignore
            return {type: doc.doc.resourceType, name: doc.doc.resourceName};
        });
    }
    return [];
}

export {
    doSearch,
    loadResources
};