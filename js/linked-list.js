// Linked List page (singly linked).
// Each node holds a value and a "next" pointer to the following node.
// The list only remembers the first node (head). To reach any other node
// you have to follow the next pointers one at a time.
(function () {
    const MAX = 12; // keep the chain short so the layout never breaks
    const STEP_MS = 600; // pause between search steps
    const BUSY = ["list-value", "list-push-front", "list-push-back", "list-pop-front", "list-search"];

    let head = null; // null means "points to nothing"
    let size = 0;
    let searching = false;
    const runner = createRunner();

    const chain = document.getElementById("list-chain");
    const msg = document.getElementById("list-msg");
    const input = document.getElementById("list-value");

    // Draw the chain by walking from head until next is null.
    // marks (optional) maps a position to a CSS class, e.g. { 2: "current" }.
    function draw(marks) {
        marks = marks || {};
        document.getElementById("list-size").textContent = size;
        document.getElementById("list-head").textContent = head ? head.value : "NULL";

        let html = '<span class="ll-label">HEAD</span><span class="ll-arrow">→</span>';
        let node = head;
        let i = 0;
        while (node !== null) {
            const cls = marks[i] ? ` ${marks[i]}` : "";
            html += '<span class="ll-item">';
            html += `<span class="ll-node${cls}"><span class="ll-value">${node.value}</span><span class="ll-next">next</span></span>`;
            html += '<span class="ll-arrow">→</span>';
            html += "</span>";
            node = node.next;
            i++;
        }
        html += '<span class="ll-null">NULL</span>';
        if (head === null) {
            html += '<p class="empty">The list is empty. HEAD points to NULL.</p>';
        }
        chain.innerHTML = html;
    }

    // Read the input for a push. Returns null (and explains why) if it can't.
    function valueToAdd() {
        if (size >= MAX) {
            msg.textContent = `The list is full (${MAX} nodes max here). Pop one first.`;
            return null;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return null;
        }
        input.value = "";
        read.note = read.random ? `No number typed, so I picked ${read.value}. ` : "";
        return read;
    }

    function pushFront() {
        const read = valueToAdd();
        if (read === null) return;
        const oldHead = head;
        // The new node points at the old first node, then becomes the head.
        // No other node changes, so this is O(1).
        head = { value: read.value, next: oldHead };
        size++;
        const target = oldHead ? `the old head (${oldHead.value})` : "NULL";
        msg.textContent = `${read.note}New node ${read.value} points to ${target}, and HEAD now points to it. Nothing else had to move.`;
        draw({ 0: "new" });
    }

    function pushBack() {
        const read = valueToAdd();
        if (read === null) return;
        const node = { value: read.value, next: null };
        if (head === null) {
            head = node;
            msg.textContent = `${read.note}The list was empty, so HEAD now points to ${read.value}.`;
        } else {
            // Walk to the last node (the one whose next is null). O(n).
            let last = head;
            let steps = 0;
            while (last.next !== null) {
                last = last.next;
                steps++;
            }
            last.next = node;
            const walk = steps === 0
                ? "The head was also the last node"
                : `Walked ${steps} link${steps === 1 ? "" : "s"} from HEAD to the last node`;
            msg.textContent = `${read.note}${walk} (${last.value}). Its next now points to ${read.value}.`;
        }
        size++;
        draw({ [size - 1]: "new" });
    }

    function popFront() {
        if (head === null) {
            msg.textContent = "The list is empty. There is nothing to pop.";
            return;
        }
        const removed = head.value;
        // Just move head to the second node. The old one is left behind.
        head = head.next;
        size--;
        const now = head ? `HEAD now points to ${head.value}.` : "HEAD now points to NULL, so the list is empty.";
        msg.textContent = `Removed ${removed} from the front. ${now}`;
        draw();
    }

    function setSearching(on) {
        searching = on;
        setDisabled(BUSY, on);
    }

    // Follow the chain one node at a time, highlighting each visit.
    async function search() {
        if (head === null) {
            msg.textContent = "The list is empty, so there is nothing to search.";
            return;
        }
        if (input.value.trim() === "") {
            msg.textContent = "Type the number you want to search for, then press search.";
            return;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }

        const token = runner.start();
        setSearching(true);
        const marks = {};
        let node = head;
        let i = 0;
        while (node !== null) {
            marks[i] = "current";
            draw(marks);
            const found = node.value === read.value;
            msg.textContent = `Looking at node ${i + 1}: is ${node.value} equal to ${read.value}? ${found ? "Yes!" : "No, follow next."}`;
            await sleep(STEP_MS);
            if (!runner.alive(token)) return; // cancelled by Reset or leaving

            if (found) {
                marks[i] = "found";
                draw(marks);
                msg.textContent = `Found ${read.value} at node ${i + 1} after checking ${i + 1} node${i === 0 ? "" : "s"}.`;
                setSearching(false);
                return;
            }
            marks[i] = "visited";
            node = node.next;
            i++;
        }
        draw(marks);
        msg.textContent = `Reached NULL. ${read.value} is not in the list. Every node was checked.`;
        setSearching(false);
    }

    // Stop a running search and put the page back to normal.
    function stop() {
        runner.cancel();
        setSearching(false);
        draw();
    }

    function reset() {
        head = null;
        size = 0;
        input.value = "";
        stop();
        msg.textContent = "Fresh start. The list is empty. Press push_front or push_back.";
    }

    document.getElementById("list-push-front").onclick = pushFront;
    document.getElementById("list-push-back").onclick = pushBack;
    document.getElementById("list-pop-front").onclick = popFront;
    document.getElementById("list-search").onclick = search;
    document.getElementById("list-reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") pushBack();
    });
    setupInfo("list-info-btn", "list-info");
    onLeavePage("linked-list-page", function () {
        if (searching) {
            stop();
            msg.textContent = "Search cancelled because you left the page.";
        }
    });

    draw();
})();
