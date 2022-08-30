// @ts-ignore
import Papa, {LocalFile, ParseResult, ParseStepResult} from "papaparse";
// @ts-ignore
import {Document} from 'flexsearch';

export interface Resource {
    readonly rt: string         // resource type (lambda, ec2)
    readonly rn: string         // resource name
    readonly rg: string         // region
    readonly pr: string         // profile
}


function newIndex() {
    return new Document({
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
}

let index = newIndex();

function loadResources(file: LocalFile) {

    index = newIndex();
    let i = 1;
    Papa.parse(file, {
        step: function (row: ParseStepResult<Resource>) {
            // @ts-ignore
            const [profile, region, resourceType, resourceName] = row.data;
            if (resourceName) {
                // @ts-ignore
                index.add({id: i++, rt: resourceType, rn: resourceName, rg: region, pr: profile});
            }
        },
        complete() {
            console.log("parsed:", i, "records");
            console.log("Searching 'lambda'", index.search('test', {enrich: true, index: "rn", limit: 10}));
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
            return {rt: doc.doc.rt, rn: doc.doc.rn, rg: doc.doc.rg, pr: doc.doc.pr};
        });
    }
    return [];
}

export {
    doSearch,
    loadResources
};