const handleForm = async e => {
    e.preventDefault();
    document.querySelector("#submit").disabled = true;
    const id = (await (await fetch("/qna/new", {
        "method": "POST",
        "body": JSON.stringify({
            "title": document.querySelector("#title").value,
            "content": document.querySelector("#content").value
        }),
        "headers": {
            "Content-Type": "application/json"
        }
    })).json()).id;
    location.href = "/qna/post.html?id=" + id;
};
document.querySelector("#form").addEventListener("submit", handleForm);