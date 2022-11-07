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


type Paper = {
    categories: string;
    paper_pk: string;
    year: string;
    paper_id: string;
    authors: string;
    title: string;
    what: string;
    why: string;
    abstract: string;
    similarity_score: number;
}


export const Home = () => {
    const [url, setUrl] = useState<string>('');
    const [currentPaper, setCurrentPaper] = useState<Paper>();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [title, setTitle] = useState<string>('');
    const [paperId, setPaperId] = useState<string>('');
    const [open, setOpen] = React.useState(true);

    let {push} = useHistory();

    /**
     * Get current URL
     */
    useEffect(() => {
        getCurrentTabUrl((url) => {
            setUrl(url || 'undefined');
        })
        getPaperInfo()
    }, []);

    const handleClick = () => {
        setOpen(!open);
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
                    fetch('https://simpa.community.saturnenterprise.io/api/v1/paper/vectorsearch/id', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "paper_id": response[1],
                            "number_of_results": 10,
                            "search_type": "KNN"
                        })
                    }).then(
                        resp => resp.json() // this returns a promise
                      ).then(repos => {
                         if (repos.papers.length > 0) {
                            setPapers(repos.papers.slice(1))
                            setCurrentPaper(repos.papers[0])
                         }
                      }).catch(ex => {
                        console.error(ex);
                      })
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
            { papers?.map(paper => {
                return (
                <div>
                <ListItemButton onClick={handleClick}>
                <div className="List-Text"> {paper.title} </div>
                {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                 <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }}>
                        {currentPaper?.what}
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }}>
                        {paper.what}
                    </ListItemButton>
                </List>
                </Collapse>
                </div>
                )
            })}
            {/* <ListItemButton onClick={handleClick}>
            <div className="List-Text"> {title} </div>
            {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                 <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }}>
                        {paperId}
                    </ListItemButton>
                </List>
            </Collapse> */}
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
