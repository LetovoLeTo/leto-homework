const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

fetch("/qna/post?id=" + id).then(res => res.json()).then(res => {
    let title = document.createElement("h2");
    title.innerText = res.title;
    document.querySelector("#post").appendChild(title);

    let content = document.createElement("p");
    content.innerText = res.content;
    document.querySelector("#post").appendChild(content);
});