import React, {useEffect, useState} from 'react';
import './App.css';
import {Autocomplete, Chip, createTheme, CssBaseline, Grid, TextField, ThemeProvider} from "@mui/material";
import {doSearch, loadResources} from "./aws/search";
import {navigateToResource} from "./aws/navigation";
import {Resource} from "./aws/interfaces";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const openRequest = window.indexedDB.open('resources-db', 1);
console.log(openRequest);


function App() {
    const [value, setValue] = useState<Resource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly Resource[]>([]);

    useEffect(
        () => {
            setOptions(doSearch(inputValue));
        },
        [inputValue]);
    useEffect(        () => {
            if (value) {
                navigateToResource(value);
            }
        },
        [value]);

    const onFileChange = (event: any) => {
        let file = event.target.files[0];
        if (file) {
            console.log(file);
            loadResources(file);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <h4>Type resource name to start searching</h4>
            <input type="file" onChange={onFileChange} accept=".zip, .csv, .tsv"/>
            <Grid container>
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
                        option.rn === value.rn &&
                        option.rt === value.rt &&
                        option.rg === value.rg}
                    onChange={(event: any, newValue: Resource | null) => {
                        setValue(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="AWS resource name"/>}
                    renderOption={(props, option) => (
                        <li {...props} key={option.rn + option.rt + option.rg}>
                            {option.rn}
                            <div style={{marginLeft: 'auto', marginRight: '0'}}>
                                <Chip label={option.rt} size="small"></Chip>
                                <Chip label={option.rg} size="small"></Chip>
                            </div>
                        </li>
                    )}
                />

            </Grid>
        </ThemeProvider>
    );
}

export default App;