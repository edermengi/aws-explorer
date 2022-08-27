import React, {useEffect, useState} from 'react';
import './App.css';
import {Autocomplete, createTheme, CssBaseline, Grid, TextField, ThemeProvider} from "@mui/material";
import {resources, loadResources, doSearch, Resource} from "./aws/search";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

loadResources();


function App() {
    const [value, setValue] = useState<Resource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly Resource[]>([]);

    useEffect(
        () => {
            console.log(inputValue);
            setOptions(doSearch(inputValue));
        },
        [inputValue]);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <Grid>
                <Autocomplete
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.name
                    }
                    filterOptions={(x) => x}
                    options={options}
                    autoComplete
                    includeInputInList
                    filterSelectedOptions
                    value={value}
                    onChange={(event: any, newValue: Resource | null) => {
                        setOptions(newValue ? [newValue, ...options] : options);
                        setValue(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    renderInput={(params) => <TextField {...params} label=""/>}
                />

            </Grid>
        </ThemeProvider>
    );
}

export default App;
