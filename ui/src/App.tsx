import React, {useEffect, useState} from 'react';
import './App.css';
import {Autocomplete, Chip, createTheme, CssBaseline, Grid, TextField, ThemeProvider} from "@mui/material";
import {doSearch, loadResources, Resource} from "./aws/search";


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


function makeAwsUrl(r: Resource | null): string {
    console.log(r);
    if (!r) return '';
    switch (r.rt) {
        case 'lambda':
            return `https://${r.rg}.console.aws.amazon.com/lambda/home?region=${r.rg}#/functions/${r.rn}`;
        case 'loggroup':
            return `https://${r.rg}.console.aws.amazon.com/cloudwatch/home?region=${r.rg}#logsV2:log-groups/log-group/${encodeURIComponent(encodeURIComponent(r.rn))}`;
        case 'secret':
            return `https://${r.rg}.console.aws.amazon.com/secretsmanager/secret?name=${r.rn}&region=${r.rg}`;
        case 'bucket':
            return `https://s3.console.aws.amazon.com/s3/buckets/${r.rn}?tab=objects`;
        case 'dynamodb':
            return `https://${r.rg}.console.aws.amazon.com/dynamodbv2/home?region=${r.rg}#item-explorer?initialTagKey=&maximize=true&table=${r.rn}`;
        case 'rds-cluster':
            return `https://${r.rg}.console.aws.amazon.com/rds/home?region=${r.rg}#database:id=${r.rn};is-cluster=true;tab=configuration`;
        case 'rds-db':
            return `https://${r.rg}.console.aws.amazon.com/rds/home?region=${r.rg}#database:id=${r.rn};is-cluster=false;tab=configuration`;
        case 'security-group':
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#SecurityGroup:groupId=${r.rn.split(',')[0]}`;
        case 'elb':
        case 'elb-v2':
            return `https://${r.rg}.console.aws.amazon.com/ec2/v2/home?region=${r.rg}#LoadBalancers:search=${r.rn};sort=loadBalancerName`;
        case 'sqs':
            return `https://${r.rg}.console.aws.amazon.com/sqs/v2/home?region=${r.rg}#/queues/${encodeURIComponent(r.rn)}`;
        case 'sns':
            return `https://${r.rg}.console.aws.amazon.com/sns/v3/home?region=${r.rg}#/topics`;
    }
    return ``;
}


function App() {
    const [value, setValue] = useState<Resource | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly Resource[]>([]);

    useEffect(
        () => {
            setOptions(doSearch(inputValue));
        },
        [inputValue]);
    useEffect(
        () => {
            if (value) {
                window.open(makeAwsUrl(value), '_blank')?.focus();
            }
        },
        [value]);

    const onFileChange = (event: any) => {
        let file = event.target.files[0];
        if (file) {
            loadResources(file);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <h4>Type resource name to start searching</h4>
            <input type="file" onChange={onFileChange}/>
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
