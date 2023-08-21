const express = require("express");
const { join } = require("path");

const app = express();

app.use("/qna", express.static(join(__dirname, "html")));
app.get("/qna", (req, res) => {
    res.sendFile(join(__dirname, "html/index.html"));
});

module.exports = app;