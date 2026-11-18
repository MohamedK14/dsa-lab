let lastIndex = -1;

function showFact() {
    let i;
    do {
        i = Math.floor(Math.random() * facts.length);
    } while (i === lastIndex);
    lastIndex = i;
    document.getElementById("dyk-text").textContent = facts[i];
}

document.getElementById("dyk-next").onclick = showFact;
showFact();
