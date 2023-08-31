const express = require("express");
const { join } = require("path");
const { stringReplace } = require("string-replace-middleware");
const webpush = require("web-push");
const db = require("leto-database");

const router = express.Router();

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

router.use(stringReplace({
    "{{publicVapidKey}}": vapidPublicKey
}, {
    "contentTypeFilterRegexp": /./
}));
router.use(express.json());
webpush.setVapidDetails("mailto:2026plyasovskikh.md@student.letovo.ru", vapidPublicKey, vapidPrivateKey);

router.post("/qna/subscribe", (req, res) => {
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
router.post("/qna/new", (req, res) => {
    if(req.body.title.length > 200 || req.body.content.length > 5000)
        return res.status(400).json({ "error": "Message too long!" });
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
    notif.url = new URL("/qna/post.html?id=" + String(questions.json.length - 1), req.headers["origin"]);
    for(let i of subscriptions.json)
        webpush.sendNotification(i, JSON.stringify(notif)).catch(console.error);
});
router.get("/qna/post", (req, res) => {
    res.status(200).json(questions.json[parseInt(req.query.id)]);
});
router.get("/qna/latest", (req, res) => {
    res.status(200).json(
        [...questions.json].reverse().slice(0, 20).map((x, i) => Object.assign({ "id": questions.json.length - i - 1 }, x))
    );
});
router.post("/qna/comment", (req, res) => {
    if(req.body.content.length > 1000)
        return res.status(400).json({ "error": "Message too long!" });
    questions.json[parseInt(req.body.id)].comments.push({
        "content": req.body.content
    });
    questions.save();
    res.status(201).json({});
});

router.use("/qna", express.static(join(__dirname, "html")));
router.get("/qna", (req, res) => {
    res.sendFile(join(__dirname, "html/index.html"));
});

module.exports = router;