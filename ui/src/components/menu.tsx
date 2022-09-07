import React from "react";
import {Box, Button, Chip, Grid, IconButton, Toolbar, Tooltip, Typography} from "@mui/material";
import {FileOpen, GitHub} from "@mui/icons-material";
import InfoButton from "./info";
import {IndexInfo} from "../aws/interfaces";

type MenuBarProps = {
    onFileChange: any;
    indexInfo: IndexInfo
};

export default function MenuBar({onFileChange, indexInfo}: MenuBarProps) {
    return (
        <Box sx={{flexGrow: 1}}>
            <Toolbar>
                <Typography component="div" sx={{flexGrow: 1}}>
                    <Button variant="outlined" component="label" startIcon={<FileOpen/>}>
                        Open CSV file with names
                        <input type="file" hidden onChange={onFileChange} accept=".csv"/>
                    </Button>
                    <span style={{paddingLeft: 10}}>{indexInfo.fileName}: {indexInfo.totalNames} names</span>
                </Typography>
                <InfoButton/>
                <Tooltip title="Open Github project">
                    <IconButton aria-label="Github repository" target="_blank"
                                href="https://github.com/edermengi/aws-navigator">
                        <GitHub/>
                    </IconButton>
                </Tooltip>
            </Toolbar>
            <Box>
                <Grid spacing={1} container>
                    <Grid xs={1} item>
                        Profiles:
                    </Grid>
                    <Grid xs={5} item>
                        {indexInfo.profiles.length > 0 &&
                            indexInfo.profiles.map((profile) => {
                                return <Chip key={profile} label={profile} size="small"/>
                            })
                        }
                    </Grid>
                    <Grid xs={1} item>
                        Regions:
                    </Grid>
                    <Grid xs={5} item>
                        {indexInfo.regions.length > 0 &&
                            indexInfo.regions.map((region) => {
                                return <Chip key={region} label={region} size="small"/>
                            })
                        }
                    </Grid>
                </Grid>

            </Box>
        </Box>
    );
}