import React from "react";
import {IconButton, Link, Popover, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";
import {pink} from "@mui/material/colors";

export default function InfoButton() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>
            <IconButton onClick={handleClick}>
                <Info/>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <div style={{textAlign: "center"}}>Full text search of AWS resource names</div>
                <ol>
                    <li>Download Python script from Github using this <Link
                        href="https://raw.githubusercontent.com/edermengi/aws-navigator/main/aws/get-aws-names.py"
                        target="_blank">link</Link>
                    </li>
                    <li>
                        Run the script on you local machine with the following arguments
                        <pre style={{whiteSpace: "normal", fontSize: "1em"}}>
                            <code>
                            python get-aws-names.py --profiles profile1 profile2 --regions eu-west-1 us-east-1
                                    --output-file /path/to/your/file.csv
                            </code>
                        </pre>
                        The script will store AWS names to the CSV output-file:
                        <pre style={{fontSize: "0.9em"}}>
                            profile1,eu-west-1,lambda,MyLambdaName<br/>
                            profile1,us-east-1,loggroup,LogGroupName1<br/>
                            profile2,eu-west-1,dynamodb,Table1
                        </pre>
                    </li>
                    <li>
                        Open the file with names using button "OPEN CSV FILE WITH NAMES". Start typing name in the input
                        field. <br/>
                        When name is selected AWS Navigator will open corresponding AWS Console page in a new browser
                        tab.<br/>
                    </li>
                </ol>
                <div style={{textAlign: "center"}}>
                    <Typography>
                        <span style={{color: pink[500], paddingRight: 10}}>!!!</span>Search is done locally in your
                        browser. No files are uploaded to the network.<span
                        style={{color: pink[500], paddingLeft: 10}}>!!!</span>
                    </Typography>
                </div>

                <div style={{
                    textAlign: "center",
                    fontSize: "0.8em",
                    paddingTop: 40,
                }}>
                    Powered by
                    <Link href="https://github.com/nextapps-de/flexsearch#document.search" target="_blank" style={{paddingLeft: 20}}>
                        <img
                            src="https://raw.githubusercontent.com/nextapps-de/flexsearch/master/doc/flexsearch-logo.svg"
                            style={{height: 30}}/>
                    </Link>
                    <Link href="https://github.com/mholt/PapaParse" target="_blank" style={{paddingLeft: 20}}>
                        <img style={{height: 30}}
                             src="https://raw.githubusercontent.com/mholt/PapaParse/master/docs/favicon.ico"/>PapaParse
                    </Link>
                </div>
            </Popover>
        </div>
    );
}
