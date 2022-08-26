import React from 'react';
import './App.css';
import {Autocomplete, createTheme, CssBaseline, Grid, TextField, ThemeProvider} from "@mui/material";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    const options = [
        {label: 'The Godfather', id: 1},
        {label: 'Pulp Fiction', id: 2},
    ];


    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Grid>
                <Autocomplete
                    renderInput={(params) => <TextField {...params} label=""/>}
                    options={options}/>

            </Grid>
        </ThemeProvider>
    );
}

export default App;
