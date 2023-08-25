const express = require("express");
const { join } = require("path");
const { stringReplace } = require("string-replace-middleware");
const webpush = require("web-push");
const db = require("leto-database");

const app = express();

const vapidPublicKey = process.env["VAPID_PUBLIC_KEY"];
const vapidPrivateKey = process.env["VAPID_PRIVATE_KEY"];

const justSubscribed = {
    "title": "Thank you for subscribing!",
    "body": "Now you will get information about new questions."
};
const newQuestion = {
    "title": "There's a new question!",
    "body": "",
    "url": ""
}

const subscriptions = db.newFile("/subscriptions.json", []);
const questions = db.newFile("/questions.json", []);

subscriptions.read();
questions.read();

app.use(stringReplace({
    "{{publicVapidKey}}": vapidPublicKey
}, {
    "contentTypeFilterRegexp": /./
}));
app.use(express.json());
webpush.setVapidDetails("mailto:2026plyasovskikh.md@student.letovo.ru", vapidPublicKey, vapidPrivateKey);

app.post("/qna/subscribe", (req, res) => {
    const subscription = req.body;
    do {
        let flag = false;
        for(let i of subscriptions.json)
            if(i.endpoint == subscription.endpoint) {
                flag = true;
                break;
            }
        if(flag) break;
        subscriptions.json.push(subscription);
        subscriptions.save();
    } while(0);
    res.status(201).json({});

    webpush.sendNotification(subscription, JSON.stringify(justSubscribed)).catch(console.error);
});
app.post("/qna/new", (req, res) => {
    questions.json.push({
        "title": req.body.title,
        "content": req.body.content,
        "comments": []
    });
    questions.save();
    res.status(201).json({
        "id": questions.json.length - 1
    });
    let notif = { ...newQuestion };
    notif.body = req.body.title;
    notif.url = new URL("/qna/post?id=" + String(questions.json.length - 1), req.headers["origin"]);
    for(let i of subscriptions.json)
        webpush.sendNotification(i, JSON.stringify(notif)).catch(console.error);
});

app.use("/qna", express.static(join(__dirname, "html")));
app.get("/qna", (req, res) => {
    res.sendFile(join(__dirname, "html/index.html"));
});

module.exports = app;