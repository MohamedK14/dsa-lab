// Queue page.
// A queue is a line: you join at the back and leave from the front.
// FIFO = First In, First Out: whoever has waited longest goes next.
(function () {
    const MAX = 10; // keep the line short so the layout never breaks

    // Index 0 is the front of the line, the last index is the back.
    let queue = [];

    const line = document.getElementById("queue-line");
    const msg = document.getElementById("queue-msg");
    const input = document.getElementById("queue-value");

    // Redraw the line. options.joined animates the new back item,
    // options.shifted makes everyone slide one place forward,
    // options.peek highlights the front item in green.
    function draw(options) {
        options = options || {};
        const size = queue.length;
        document.getElementById("queue-size").textContent = size;
        document.getElementById("queue-front").textContent = size ? queue[0] : "none";

        if (size === 0) {
            line.innerHTML = '<p class="empty">The queue is empty.</p>';
            return;
        }

        let html = "";
        for (let i = 0; i < size; i++) {
            const isFront = i === 0;
            const isBack = i === size - 1;
            let cls = "person";
            if (isBack && options.joined) cls += " new";
            if (options.shifted) cls += " shift";
            if (isFront && options.peek) cls += " peek";

            let label = "";
            if (isFront && isBack) label = "front · back";
            else if (isFront) label = "front";
            else if (isBack) label = "back";

            html += `<div class="${cls}"><span class="q-label">${label}</span>${queue[i]}</div>`;
        }
        line.innerHTML = html;
    }

    function enqueue() {
        if (queue.length >= MAX) {
            msg.textContent = `The line is full (${MAX} max here). Dequeue someone first.`;
            return;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        // New arrivals always join at the back.
        queue.push(read.value);
        input.value = "";
        const picked = read.random ? `No number typed, so I picked ${read.value}. ` : "";
        const ahead = queue.length - 1;
        const where = ahead === 0
            ? "It's the only one, so it's also at the front."
            : `There ${ahead === 1 ? "is 1" : "are " + ahead} ahead of it.`;
        msg.textContent = `${picked}${read.value} joined the back of the line. ${where}`;
        draw({ joined: true });
    }

    function dequeue() {
        if (queue.length === 0) {
            msg.textContent = "The queue is empty. There is nobody to dequeue.";
            return;
        }
        // shift() removes index 0 and moves every other item one slot forward.
        // That move is why dequeue on a plain array is O(n).
        const left = queue.shift();
        const after = queue.length
            ? `${queue[0]} is at the front now.`
            : "The queue is empty now.";
        msg.textContent = `${left} left from the front. It was first in, so it's first out. Everyone else steps forward one place. ${after}`;
        draw({ shifted: true });
    }

    function front() {
        if (queue.length === 0) {
            msg.textContent = "The queue is empty, so there is no front to look at.";
            return;
        }
        // Looking at the front doesn't change the line.
        msg.textContent = `${queue[0]} is at the front and will leave next. Looking doesn't remove anyone.`;
        draw({ peek: true });
    }

    function reset() {
        queue = [];
        input.value = "";
        msg.textContent = "Fresh start. The queue is empty. Type a number and press enqueue.";
        draw();
    }

    document.getElementById("queue-enqueue").onclick = enqueue;
    document.getElementById("queue-dequeue").onclick = dequeue;
    document.getElementById("queue-peek").onclick = front;
    document.getElementById("queue-reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") enqueue();
    });
    setupInfo("queue-info-btn", "queue-info");

    draw();
})();
