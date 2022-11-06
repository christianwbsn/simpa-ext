export {}
/** Fired when the extension is first installed,
 *  when the extension is updated to a new version,
 *  and when Chrome is updated to a new version. */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[background.js] onInstalled', details);
    alert('[background.js] onInstalled');
});

chrome.runtime.onConnect.addListener((port) => {
    console.log('[background.js] onConnect', port)
    alert('[background.js] onInstalled');
});

chrome.runtime.onStartup.addListener(() => {
    console.log('[background.js] onStartup')
    alert('[background.js] onInstalled');
});
