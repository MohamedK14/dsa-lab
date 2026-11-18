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

const msg = document.getElementById("msg");

document.getElementById("push").onclick = function () {
    let note;
    if (data.length === capacity) {
        const oldCap = capacity;
        capacity = capacity === 0 ? 1 : capacity * 2;
        note = oldCap === 0
            ? `The empty array has no room. Capacity went 0 → 1, then ${next} was added.`
            : `Array was full. Capacity grew ${oldCap} → ${capacity}, then ${next} was added.`;
    } else {
        note = `Free slot found. ${next} goes into index ${data.length}.`;
    }
    data.push(next);
    next++;
    msg.textContent = note;
    draw();
};

document.getElementById("pop").onclick = function () {
    if (data.length === 0) {
        msg.textContent = "Nothing to remove. The array is empty.";
        return;
    }
    const removed = data.pop();
    msg.textContent = `Removed ${removed}. Size dropped to ${data.length}; capacity stays ${capacity}.`;
    draw();
};

document.getElementById("reset").onclick = function () {
    data = [];
    capacity = 0;
    next = 1;
    msg.textContent = "Fresh start. Press push_back to add a number.";
    draw();
};

draw();

document.getElementById("array-info-btn").onclick = function () {
    const panel = document.getElementById("array-info");
    panel.hidden = !panel.hidden;
    this.setAttribute("aria-expanded", String(!panel.hidden));
};
