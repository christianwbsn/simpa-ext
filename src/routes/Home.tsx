import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import logo from '../paper.png';
import { ChromeMessage, Sender } from "../types";
import { getCurrentTabUId, getCurrentTabUrl } from "../chrome/utils";

export const Home = () => {
    const [url, setUrl] = useState<string>('');
    const [val, setVal] = useState(0);
    const [responseFromContent, setResponseFromContent] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [paperId, setPaperId] = useState<string>('');

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
                <p>Home</p>
                <p>{val}</p>
                <p>URL:</p>
                <p>
                    {url}
                </p>
                {/* <button onClick={sendTestMessage}>SEND MESSAGE</button>
                <button onClick={sendRemoveMessage}>Remove logo</button>
                <p>Response from content:</p>
                <p>
                    {responseFromContent}
                </p> */}

                <p>Paper details:</p>
                <p>
                    {title}
                </p>
                <p>
                    {paperId}
                </p>
                <button onClick={() => {
                    push('/about')
                }}>About page
                </button>
            </header>
        </div>
    )
}
