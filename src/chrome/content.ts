import { ChromeMessage, Sender } from "../types";

type MessageResponse = (response?: any) => void

const validateSender = (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender
) => {
    return sender.id === chrome.runtime.id && message.from === Sender.React;
}

const getPaperId =  (url: string) => {
    const pdf_regexp = /arxiv.org\/[\S]*\/([^\/]*)$/;
    url = url.replace(".pdf", "");
    if (url.endsWith("/")) url = url.slice(0, -1);
    var match;
    match = url.match(pdf_regexp);
    // The first match is the matched string, the second one is the captured group.
    if (match === null || match.length !== 2) {
      return null;
    }
    return match[1].slice(0, -2);
}

const messagesFromReactAppListener = (
    message: ChromeMessage,
    sender: chrome.runtime.MessageSender,
    response: MessageResponse
) => {

    const isValidated = validateSender(message, sender);

    if (isValidated && message.message === 'Hello from React') {
        response('Hello from content.js');
    }

    if (isValidated && message.message === "delete logo") {
        const logo = document.getElementById('hplogo');
        logo?.parentElement?.removeChild(logo)
    }

    if (message.message == "get title") {
        const title = document.querySelector(".paper-title h1")?.innerHTML.trim();
        const paperLink = document.querySelector(".paper-abstract a")?.getAttribute("href")!;
        response([title, getPaperId(paperLink)])
    }

}



const main = () => {
    console.log('[content.ts] Main')
    /**
     * Fired when a message is sent from either an extension process or a content script.
     */
    chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
}

main();


