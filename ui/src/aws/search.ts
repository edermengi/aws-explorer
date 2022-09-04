// @ts-ignore
import Papa, {LocalFile, ParseResult, ParseStepResult} from "papaparse";
// @ts-ignore
import {Document} from 'flexsearch';
import {Resource} from "./interfaces";

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

function loadResources(file: File, onLoadComplete: any) {
    index = newIndex();
    let i = 1;
    let profiles = new Set<string>();
    let regions = new Set<string>();
    Papa.parse(file, {
        worker: true,
        step: function (row: ParseStepResult<Resource>) {
            // @ts-ignore
            const [profile, region, resourceType, resourceName] = row.data;
            if (resourceName) {
                // @ts-ignore
                index.add({id: i++, rt: resourceType, rn: resourceName, rg: region, pr: profile});
                profiles.add(profile);
                regions.add(region);
            }
        },
        complete() {
            console.log("parsed:", i, "records");
            console.log("Searching 'lambda'", index.search('test', {enrich: true, index: "rn", limit: 10}));
            onLoadComplete({
                fileName: file.name,
                totalNames: i,
                profiles: Array.from(profiles),
                regions: Array.from(regions)
            });
        }
    });
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

async function exportToStorage() {
    return index.export(function (key, data) {
        console.log(key);
        return new Promise(function (resolve) {
            // @ts-ignore
            resolve();
        });
    });
}

export {
    doSearch,
    loadResources
};