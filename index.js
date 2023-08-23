const express = require("express");
const { join } = require("path");
const { stringReplace } = require("string-replace-middleware");
const webpush = require("web-push");

const app = express();

const vapidPublicKey = process.env["VAPID_PUBLIC_KEY"];
const vapidPrivateKey = process.env["VAPID_PRIVATE_KEY"];

const justSubscribed = {
    "title": "Thank you for subscribing!",
    "body": "Now you will get information about new questions."
};

app.use(stringReplace({
    "{{publicVapidKey}}": vapidPublicKey
}, {
    "contentTypeFilterRegexp": /./
}));
app.use(express.json());
webpush.setVapidDetails("mailto:2026plyasovskikh.md@student.letovo.ru", vapidPublicKey, vapidPrivateKey);

app.post("/qna/subscribe", (req, res) => {
    const subscription = req.body;
    console.log(subscription);
    res.status(201).json({});

    webpush.sendNotification(subscription, justSubscribed).catch(console.error);
});

app.use("/qna", express.static(join(__dirname, "html")));
app.get("/qna", (req, res) => {
    res.sendFile(join(__dirname, "html/index.html"));
});

module.exports = app;