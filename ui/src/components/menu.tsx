import React from "react";
import {Box, Button, IconButton, Toolbar, Tooltip, Typography} from "@mui/material";
import {FileOpen, GitHub} from "@mui/icons-material";
import InfoButton from "./info";

type MenuBarProps = {
    onFileChange: any
};

export default function MenuBar({onFileChange}: MenuBarProps) {
    return (
        <Box sx={{flexGrow: 1}}>
            <Toolbar>
                <Typography component="div" sx={{flexGrow: 1}}>
                    <Button variant="outlined" component="label" startIcon={<FileOpen/>}>
                        Open CSV file with names
                        <input type="file" hidden onChange={onFileChange} accept=".csv"/>
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