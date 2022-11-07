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
import DragHandleIcon from '@mui/icons-material/DragHandle';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ListItemIcon from '@mui/material/ListItemIcon';


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

    const findSimilarity = (paper1:Paper, paper2:Paper) => {
        var splitted_categories1 = paper1.categories.split("|")
        var splitted_categories2 = paper2.categories.split("|")
        const intersection = splitted_categories1.filter(value => splitted_categories2.includes(value));
        var similarity = []
        similarity.push("[HOW] This paper is similar by: " + paper2.similarity_score.toString())
        if (intersection.length > 0) {
            similarity.push("[WHAT] These two papers belong to the same category: " + intersection.toString())
        }

        if (paper1.year == paper2.year) {
            similarity.push("[WHEN] These two papers were published in the same year: " + paper1.year)
        }

        var splitted_authors1 = paper1.authors.split(",")
        var splitted_authors2 = paper2.authors.split(",")
        const intersectionAuthors = splitted_authors1.filter(value => splitted_authors2.includes(value));
        if (intersectionAuthors.length > 0) {
            similarity.push("[WHO] These two papers have similar authors:" + intersectionAuthors.toString())
        }

        return similarity
    }

    const openNewTab = (paperId:string) => {
        var id = paperId + "v1"
        var newURL = "https://arxiv.org/abs/" + id;
        chrome.tabs.create({ "url": newURL });
    }

    const findDissimilarity = (paper1:Paper, paper2:Paper) => {
        var dissimilarity = []
        if (paper1.what.length > 0 && paper2.what.length > 0){
            dissimilarity.push("[WHAT] " + paper2.what + "...")
        }
        if (paper1.why.length > 0 && paper2.why.length > 0){
            dissimilarity.push("[WHY] " + paper2.why +  "...")
        }

        var year1 = parseInt(paper1.year)
        var year2 = parseInt(paper2.year)
        var diff = Math.abs(year1-year2)
        if (year1 > year2) {
            dissimilarity.push("[WHEN] Your paper is newer compared to this recommendation by " + diff + " years")
        } else if (year1 < year2) {
            dissimilarity.push("[WHEN] Your paper is older compared to this recommendation by " + diff + " years")
        }
        return dissimilarity
    }

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
                            setPapers(repos.papers)
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
            { papers?.map((paper, index) => {
                if (index != 0) {
                return (
                <div>
                <ListItemButton onClick={() => (openNewTab(paper.paper_id))}>
                <div className="List-Text"> {paper.title} </div>
                {open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                 <List component="div" disablePadding>
                    { findSimilarity(papers[0], paper).map(similarity => {
                        return (
                        <ListItemButton className="Sim-Text" sx={{ pl: 4, bgcolor:"green"}}>
                        <ListItemIcon className="List-Icon">
                            <DragHandleIcon />
                        </ListItemIcon>
                            {similarity}
                        </ListItemButton>)
                    }) }

                    { findDissimilarity(papers[0], paper).map(similarity => {
                        return (
                        <ListItemButton className="Sim-Text" sx={{ pl: 4, bgcolor:"red" }}>
                        <ListItemIcon className="List-Icon">
                            <CallSplitIcon />
                        </ListItemIcon>
                        {similarity}
                        </ListItemButton>)
                    }) }
                </List>
                </Collapse>
                </div>
                )
            }})}

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
