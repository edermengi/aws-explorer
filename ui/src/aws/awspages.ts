import {Document, SimpleDocumentSearchResultSetUnit} from 'flexsearch';
import {Page} from "./interfaces";


const base = "https://console.aws.amazon.com";
// @formatter:off
const pages: Array<Page> = [
    {rn: "Console Home", url: `${base}/console/home`},
    {rn: "Lambda ", url: `${base}/lambda/home#/functions`},
    {rn: "Lambda / Dashboard", url: `${base}/lambda/home#/discover`},
    {rn: "Lambda / Applications", url: `${base}/lambda/home#/applications`},
    {rn: "Lambda / Functions", url: `${base}/lambda/home#/functions`},
    {rn: "Lambda / Additional resources / Code signing configurations", url: `${base}/lambda/home#/code-signing-configurations`},
    {rn: "Lambda / Additional resources / Layers", url: `${base}/lambda/home#/layers`},
    {rn: "S3", url: `${base}/s3/buckets`},
    {rn: "S3 / Buckets", url: `${base}/s3/buckets`},
    {rn: "S3 / Access Points", url: `${base}/s3/ap`},
];
// @formatter:on

let index = loadPageIndex();

function loadPageIndex() {
    let _index = new Document({
        tokenize: 'full',
        document: {
            id: 'id',
            store: false,
            index: [{
                field: "name"
            }]
        }
    });

    pages.forEach((page, i) => {
        _index.add({
            id: i,
            name: page.rn
        });
    })
    return _index;
}


function searchPages(query: string): Page[] {
    const response: SimpleDocumentSearchResultSetUnit[] =
        index.search(query, 5, {index: "name", limit: 5});

    if (response.length > 0) {
        const docs = response[0].result;
        let results = docs.map((id) => {
            // @ts-ignore
            return pages[id];
        });
        results[results.length - 1] = {...results[results.length - 1], last: true};
        console.log('Found', results);
        return results;
    }
    return [];
}


export {
    searchPages
};