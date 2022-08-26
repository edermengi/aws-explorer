// @ts-ignore
import Papa, {ParseStepResult} from "papaparse";

console.log('Hi');


Papa.parse('/data.local.csv', {
    download: true,
    step: function (row: ParseStepResult<Resource>) {
        console.log("Row:", row.data);
    }
})

export interface Resource {
    readonly  type: string
    readonly name: string
}


function doSearch(query: string): Resource[] {


    return [];
}

export {
    doSearch
};