// Stack page.
// A stack is a pile where you can only touch the top.
// LIFO = Last In, First Out: the last value pushed is the first one popped.
// Everything is inside a function so these names don't clash with other pages.
(function () {
    const MAX = 10; // keep the pile short so the layout never breaks

    // The end of the JS array is the top of the stack.
    // push() and pop() on a JS array both work on the end, so they map 1:1.
    let stack = [];

    const pile = document.getElementById("stack-pile");
    const msg = document.getElementById("stack-msg");
    const input = document.getElementById("stack-value");

    // Redraw the pile. options.pushed animates the new top plate,
    // options.peek highlights the top plate in green.
    function draw(options) {
        options = options || {};
        const size = stack.length;
        document.getElementById("stack-size").textContent = size;
        document.getElementById("stack-top").textContent = size ? stack[size - 1] : "none";

        if (size === 0) {
            pile.innerHTML = '<p class="empty">The stack is empty.</p>';
            return;
        }

        let html = "";
        for (let i = 0; i < size; i++) {
            const isTop = i === size - 1;
            let cls = "plate";
            if (isTop && options.pushed) cls += " new";
            if (isTop && options.peek) cls += " peek";
            html += `<div class="${cls}">${stack[i]}`;
            if (isTop) html += '<span class="top-arrow">← top</span>';
            html += "</div>";
        }
        // The pile uses flex column-reverse, so index 0 is drawn at the bottom.
        pile.innerHTML = html;
    }

    function push() {
        if (stack.length >= MAX) {
            msg.textContent = `The stack is full (${MAX} plates max here). Pushing more would be a "stack overflow". Pop something first.`;
            return;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        // New values always go on top. Nothing below has to move, so this is O(1).
        stack.push(read.value);
        input.value = "";
        const picked = read.random ? `No number typed, so I picked ${read.value}. ` : "";
        msg.textContent = `${picked}Pushed ${read.value} onto the top. As the last one in, it will be the first one out.`;
        draw({ pushed: true });
    }

    function pop() {
        if (stack.length === 0) {
            msg.textContent = "The stack is empty. There is nothing to pop.";
            return;
        }
        // Only the top can be removed. Again O(1).
        const removed = stack.pop();
        const after = stack.length
            ? `${stack[stack.length - 1]} is on top now.`
            : "The stack is empty now.";
        msg.textContent = `Popped ${removed} off the top. It was the last one in, so it's the first one out. ${after}`;
        draw();
    }

    function top() {
        if (stack.length === 0) {
            msg.textContent = "The stack is empty, so there is no top to look at.";
            return;
        }
        // Peeking reads the top value without removing it.
        msg.textContent = `The top is ${stack[stack.length - 1]}. Peeking only looks; nothing is removed.`;
        draw({ peek: true });
    }

    function reset() {
        stack = [];
        input.value = "";
        msg.textContent = "Fresh start. The stack is empty. Type a number and press push.";
        draw();
    }

    document.getElementById("stack-push").onclick = push;
    document.getElementById("stack-pop").onclick = pop;
    document.getElementById("stack-peek").onclick = top;
    document.getElementById("stack-reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") push();
    });
    setupInfo("stack-info-btn", "stack-info");

    draw();
})();
