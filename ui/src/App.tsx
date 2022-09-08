import React, {useEffect, useState} from 'react';
import {Autocomplete, Chip, createTheme, CssBaseline, Grid, TextField, ThemeProvider} from "@mui/material";
import {doSearch, loadResources} from "./aws/search";
import {navigateToResource} from "./aws/navigation";
import {IndexInfo, Resource} from "./aws/interfaces";
import MenuBar from "./components/menu";
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


function App() {
    const [value, setValue] = useState<Resource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly Resource[]>([]);
    const [indexInfo, setIndexInfo] = useState<IndexInfo>({
        fileName: '',
        totalNames: 0,
        profiles: [],
        regions: []
    });

    useEffect(
        () => {
            setOptions(doSearch(inputValue));
        },
        [inputValue]);
    useEffect(() => {
            if (value) {
                navigateToResource(value);
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
                        option.rn === value.rn &&
                        option.rt === value.rt &&
                        option.rg === value.rg &&
                        option.pr === value.pr}
                    onChange={(event: any, newValue: Resource | null) => {
                        setValue(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="AWS resource name"/>}
                    renderOption={(props, option, {inputValue}) => {
                        const matches = match(option.rn, inputValue);
                        const parts = parse(option.rn, matches);

                        return (<li {...props} key={option.rn + option.rt + option.rg + option.pr}>
                            {parts.map((part, index) => (
                                <span key={index} style={{color: part.highlight ? "lightcoral" : "white",}}>
                                {part.text}
                                </span>
                            ))}
                            <div style={{marginLeft: 'auto', marginRight: '0'}}>
                                <Chip label={option.rt} size="small"></Chip>
                                <Chip label={option.rg} size="small"></Chip>
                            </div>
                        </li>);
                    }}
                />

            </Grid>
        </ThemeProvider>
    );
}

export default App;
