import React, {useEffect, useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    createTheme,
    CssBaseline,
    Grid,
    IconButton,
    TextField,
    ThemeProvider,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {doSearch, loadResources} from "./aws/search";
import {navigateToResource} from "./aws/navigation";
import {Resource} from "./aws/interfaces";
import {FileOpen, GitHub} from "@mui/icons-material";
import InfoButton from "./components/info";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


function App() {
    const [value, setValue] = useState<Resource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly Resource[]>([]);

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
            loadResources(file);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <MenuBar onFileChange={onFileChange}/>
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
                        option.rg === value.rg &&
                        option.pr === value.pr}
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

class MenuBar extends React.Component<{ onFileChange: any }> {
    render() {
        let {onFileChange} = this.props;
        return (
            <Box sx={{flexGrow: 1}}>
                <Toolbar>
                    <Typography component="div" sx={{flexGrow: 1}}>
                        <Button variant="contained" component="label" startIcon={<FileOpen/>}>
                            Open CSV file with names
                            <input type="file" hidden onChange={onFileChange} accept=".zip, .csv, .tsv"/>
                        </Button>
                    </Typography>
                    <InfoButton/>
                    <Tooltip title="Open Github project">
                        <IconButton aria-label="Github repository" target="_blank"
                                    href="https://github.com/edermengi/aws-navigator">
                            <GitHub/>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </Box>
        );
    }
}

export default App;
