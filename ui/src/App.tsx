import React, {useEffect, useState} from 'react';
import {Autocomplete, Chip, createTheme, CssBaseline, Divider, Grid, TextField, ThemeProvider} from "@mui/material";
import {loadResources, searchResources} from "./aws/search";
import {navigateToPage, navigateToResource} from "./aws/navigation";
import {IndexInfo, isResource, Page, PageOrResource, Resource} from "./aws/interfaces";
import MenuBar from "./components/menu";
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import {searchPages} from "./aws/awspages";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


function getKey(option: PageOrResource): string {
    if (isResource(option)) {
        const r = option as Resource;
        return r.rn + r.rt + r.rg + r.pr;
    } else {
        const p = option as Page;
        return `page-${p.rn}`;
    }
}

function App() {
    const [value, setValue] = useState<PageOrResource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly PageOrResource[]>([]);
    const [indexInfo, setIndexInfo] = useState<IndexInfo>({
        fileName: '',
        totalNames: 0,
        profiles: [],
        regions: []
    });

    useEffect(
        () => {
            let results = [...searchPages(inputValue), ...searchResources(inputValue)]
            setOptions(results);
        },
        [inputValue]);
    useEffect(() => {
            if (value) {
                if (isResource(value)) {
                    navigateToResource(value as Resource);
                } else {
                    navigateToPage(value as Page);
                }
            }
        },
        [value]);

    const onFileChange = (event: any) => {
        let file = event.target.files[0];
        if (file) {
            console.log(file);
            loadResources(file, setIndexInfo);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <MenuBar onFileChange={onFileChange} indexInfo={indexInfo}/>
            <Grid container sx={{paddingTop: 2}}>
                <Autocomplete
                    fullWidth
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.rn
                    }
                    filterOptions={(x) => x}
                    options={options}
                    includeInputInList
                    value={value}
                    isOptionEqualToValue={(option, value) =>
                        option === value}
                    onChange={(event: any, newValue: PageOrResource | null) => {
                        setValue(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="AWS resource name"/>}
                    renderOption={(props, option, {inputValue}) => {
                        const matches = match(option.rn, inputValue, {insideWords: true});
                        const parts = parse(option.rn, matches);

                        return (<>
                                <li {...props} key={getKey(option)}>
                                    {parts.map((part, index) => (
                                        <span key={index} style={{color: part.highlight ? "lightcoral" : "white",}}>
                                {part.text}
                                </span>
                                    ))}
                                    {isResource(option) &&
                                        <div style={{marginLeft: 'auto', marginRight: '0'}}>
                                            <Chip label={(option as Resource).rt} size="small"></Chip>
                                            <Chip label={(option as Resource).rg} size="small"></Chip>
                                        </div>
                                    }
                                </li>
                                {!isResource(option) && (option as Page).last &&
                                    <Divider component="li" key='divider'/>
                                }
                            </>
                        );
                    }}
                />

            </Grid>
        </ThemeProvider>
    );
}

export default App;
