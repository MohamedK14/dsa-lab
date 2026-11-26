// The buttons and animation of a self-balancing tree page. The AVL and
// Red-Black pages both use this and only plug in their own rules.
//
// config:
//   prefix        start of the element ids, e.g. "avl"
//   pageId        id of the page section
//   insert        generator (tree, value) that inserts with steps
//   remove        generator (tree, value) that deletes with steps, or null
//   drawOptions   extra options for drawTree (labels and colours)
//   showStats     function (tree) that fills in page-specific numbers
//   sortedSummary function (tree) giving the message after "Insert sorted"
function setupTreePage(config) {
    const MAX = 15;
    const STEP_MS = 750; // pause between animation steps
    const id = function (name) { return document.getElementById(`${config.prefix}-${name}`); };
    const BUSY = ["value", "insert", "search", "random", "sorted"]
        .concat(config.remove ? ["delete"] : [])
        .map(function (name) { return `${config.prefix}-${name}`; });

    let tree = createTree();
    let pending = null; // the operation being animated, if any
    const runner = createRunner();
    const svg = id("svg");
    const msg = id("msg");
    const input = id("value");

    function draw(marks) {
        id("size").textContent = tree.size;
        id("height").textContent = treeHeight(tree.root);
        id("rotations").textContent = tree.rotations;
        if (config.showStats) config.showStats(tree);
        id("empty").hidden = tree.root !== null;
        drawTree(svg, tree.root, marks, config.drawOptions);
    }

    // Show an operation one step at a time. "note" is added to the first message.
    async function play(operation, note) {
        const token = runner.start();
        pending = operation;
        setDisabled(BUSY, true);
        let first = true;
        while (true) {
            const result = operation.next();
            draw(result.value.marks);
            msg.textContent = (first && note ? note : "") + result.value.text;
            first = false;
            if (result.done) break;
            await sleep(STEP_MS);
            if (!runner.alive(token)) return; // Reset or leaving the page
        }
        pending = null;
        setDisabled(BUSY, false);
    }

    // Run an operation to the end without pausing, and return its last message.
    function finishNow(operation) {
        let result = operation.next();
        while (!result.done) result = operation.next();
        return result.value;
    }

    function contains(value) {
        return inorderNodes(tree.root).some(function (n) { return n.value === value; });
    }

    function insert() {
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        // A random pick should not collide with a value already in the tree.
        while (read.random && contains(read.value)) {
            read.value = Math.floor(Math.random() * 99) + 1;
        }
        if (tree.size >= MAX && !contains(read.value)) {
            msg.textContent = `The tree is full (${MAX} nodes max here). ${config.remove ? "Delete a value or press Reset." : "Press Reset to start again."}`;
            return;
        }
        input.value = "";
        play(config.insert(tree, read.value), read.random ? `No number typed, so I picked ${read.value}. ` : "");
    }

    // Search and delete need a number typed by the visitor.
    function withTypedValue(action, operation) {
        if (tree.root === null) {
            msg.textContent = `The tree is empty, so there is nothing to ${action}.`;
            return;
        }
        if (input.value.trim() === "" && !input.validity.badInput) {
            msg.textContent = `Type the number you want to ${action}, then press ${action}.`;
            return;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        if (action === "delete") input.value = "";
        play(operation(tree, read.value));
    }

    function randomFill() {
        tree = createTree();
        const count = 7 + Math.floor(Math.random() * 6); // 7 to 12 nodes
        while (tree.size < count) {
            finishNow(config.insert(tree, Math.floor(Math.random() * 99) + 1));
        }
        draw();
        msg.textContent = `Built a new tree with ${count} random numbers. It balanced itself along the way (rotations: ${tree.rotations}).`;
    }

    function* sortedSteps() {
        for (let value = 1; value <= 7; value++) {
            yield { text: `Next value in sorted order: ${value}.`, marks: {} };
            // yield* shows every step of the insert, then gives its last message.
            yield yield* config.insert(tree, value);
        }
        return { text: config.sortedSummary(tree), marks: {} };
    }

    function reset() {
        runner.cancel();
        pending = null;
        setDisabled(BUSY, false);
        tree = createTree();
        input.value = "";
        draw();
        msg.textContent = "Fresh start. The tree is empty. Insert a value or press Random fill.";
    }

    id("insert").onclick = insert;
    id("search").onclick = function () { withTypedValue("search", searchSteps); };
    if (config.remove) {
        id("delete").onclick = function () { withTypedValue("delete", config.remove); };
    }
    id("random").onclick = randomFill;
    id("sorted").onclick = function () {
        tree = createTree();
        play(sortedSteps());
    };
    id("reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") insert();
    });
    setupInfo(`${config.prefix}-info-btn`, `${config.prefix}-info`);
    onLeavePage(config.pageId, function () {
        if (pending === null) return;
        // Stopping halfway through a rotation would leave a broken tree, so
        // finish the whole operation instantly instead.
        runner.cancel();
        const last = finishNow(pending);
        pending = null;
        setDisabled(BUSY, false);
        draw();
        msg.textContent = `You left the page, so the animation was skipped to the end. ${last.text}`;
    });

    draw();
}
