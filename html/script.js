const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

if(localStorage.getItem("subscribed") === null)
    localStorage.setItem("subscribed", "no");
else if(localStorage.getItem("subscribed") == "yes")
    document.addEventListener("DOMContentLoaded", () => document.querySelector("#question-notifications").remove());

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

document.addEventListener("DOMContentLoaded", () => fetch("/qna/latest").then(res => res.json()).then(res => {
    for(let i of res) {
        let x = document.createElement("div");
        x.classList.add("notify");
        
        let title = document.createElement("h1");
        let link = document.createElement("a");
        link.href = "/qna/post.html?id=" + i.id;
        link.innerText = i.title;
        title.appendChild(link);
        x.appendChild(title);
        
        let content = document.createElement("p");
        content.innerText = i.content;
        x.appendChild(content);

        document.querySelector("#latest-questions").appendChild(x);
    }
}));