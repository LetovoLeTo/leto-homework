const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

if(localStorage.getItem("subscribed") === null)
    localStorage.setItem("subscribed", "no");
else if(localStorage.getItem("subscribed") == "yes")
    document.addEventListener("DOMContentLoaded", e => document.querySelector("#question-notifications").remove());

const vapidKey = "{{publicVapidKey}}";
const subscribe = async () => {
    const register = await navigator.serviceWorker.register("/qna/worker.js", {
        "scope": "/qna/"
    });
    while(!register.active) await sleep(100);   
    const subscription = await register.pushManager.subscribe({
        "userVisibleOnly": true,
        "applicationServerKey": vapidKey
    });
    console.log(subscription.toJSON());
    await fetch("/qna/subscribe", {
        "method": "POST",
        "body": JSON.stringify(subscription.toJSON()),
        "headers": {
            "Content-Type": "application/json"
        }
    });
    localStorage.setItem("subscribed", "yes");
};