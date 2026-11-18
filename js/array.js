let data = [];
let capacity = 0;
let next = 1;

function draw() {
    document.getElementById("size").textContent = data.length;
    document.getElementById("cap").textContent = capacity;
    let html = "";
    for (let i = 0; i < capacity; i++) {
        if (i < data.length) {
            html += `<div class="slot filled">${data[i]}</div>`;
        } else {
            html += `<div class="slot"></div>`;
        }
    }
    document.getElementById("slots").innerHTML = html;
}

document.getElementById("push").onclick = function () {
    if (data.length === capacity) {
        capacity = capacity === 0 ? 1 : capacity * 2;
    }
    data.push(next);
    next++;
    draw();
};

draw();
