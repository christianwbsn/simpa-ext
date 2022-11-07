import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from '../logo.png';
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';

export const Home = () => {
    const [url, setUrl] = useState<string>('');
    const [val, setVal] = useState(0);
    const [responseFromContent, setResponseFromContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [paperId, setPaperId] = useState<string>('');
    const [open, setOpen] = React.useState(false);

    let {push} = useHistory();

    /**
     * Get current URL
     */
    useEffect(() => {
        getCurrentTabUrl((url) => {
            setUrl(url || 'undefined');
        })
        getPaperInfo()
        fetch('https://simpa.community.saturnenterprise.io/predict?BedroomAbvGr=8&YearBuilt=2000').then(
            resp => resp.json() // this returns a promise
          ).then(repos => {
             setVal(repos.prediction)
          }).catch(ex => {
            console.error(ex);
          })
    }, []);

    const handleClick = () => {
        setOpen(!open);
      };

    const sendTestMessage = () => {
        const message: ChromeMessage = {
            from: Sender.React,
            message: "Hello from React",
        }

        getCurrentTabUId((id) => {
            id && chrome.tabs.sendMessage(
                id,
                message,
                (responseFromContentScript) => {
                    setResponseFromContent(responseFromContentScript);
                });
        });
    };

    const sendRemoveMessage = () => {
        const message: ChromeMessage = {
            from: Sender.React,
            message: "delete logo",
        }

        getCurrentTabUId((id) => {
            id && chrome.tabs.sendMessage(
                id,
                message,
                (response) => {
                    setResponseFromContent(response);
                });
        });
    };

    const getPaperInfo = () => {
        const message: ChromeMessage = {
            from: Sender.React,
            message: "get title",
        }

        getCurrentTabUId((id) => {
            id && chrome.tabs.sendMessage(
                id,
                message,
                (response) => {
                    setTitle(response[0]);
                    setPaperId(response[1]);
                });
        });
    };


    return (
        <div className="App">
            <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            </header>
            <div className="App-body">
            Found similar papers to: <br></br>
            <b>{title}</b>
            <List
                sx={{ width: '100%', bgcolor: '#34697F'}}
                component="nav"
            >
            <ListItemButton onClick={handleClick}>
            <div className="List-Text"> {title} </div>
            {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                 <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }}>
                        {paperId}
                    </ListItemButton>
                </List>
            </Collapse>
            </List>
            </div>
            <footer className="App-footer">
                Simpa v1.0.0
            </footer>
            {/* <p>{url}</p>
                <p>Paper details:</p>
                <p>{title}</p>
                <p>{paperId}</p> */}
        </div>
    )
}
