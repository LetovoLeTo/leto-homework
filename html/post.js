const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

fetch("/qna/post?id=" + id).then(res => res.json()).then(res => {
    let title = document.createElement("h2");
    title.innerText = res.title;
    document.querySelector("#post").appendChild(title);

    let content = document.createElement("p");
    content.innerText = res.content;
    document.querySelector("#post").appendChild(content);

    for(let i of res.comments) {
        let comment = document.createElement("div");
        comment.classList.add("notify");
        // comment.innerHTML += "<h1 class=\"header\">Comment</h1>";
        comment.innerText += i.content;
        comment.style.textAlign = "left";
        document.querySelector("#comments").appendChild(comment);
    }
});

document.querySelector("#form").addEventListener("submit", async e => {
    e.preventDefault();
    
    await fetch("/qna/comment", {
        "method": "POST",
        "body": JSON.stringify({
            "content": document.querySelector("#content").value,
            "id": id
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    });
    location.reload();
});