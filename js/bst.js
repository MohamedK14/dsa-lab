// Binary Search Tree (BST) page.
// The rule: everything in a node's left subtree is smaller than the node, and
// everything in its right subtree is bigger. So at every node we only need to
// pick one side, and can ignore the whole other side.
(function () {
    const MAX = 15;
    const STEP_MS = 800; // pause between animation steps
    const BUSY = ["bst-value", "bst-insert", "bst-search", "bst-delete", "bst-min", "bst-max", "bst-inorder", "bst-random", "bst-sorted"];

    let root = null;
    let size = 0;
    let nextId = 1;
    let animating = false;
    const runner = createRunner();

    const svg = document.getElementById("bst-svg");
    const msg = document.getElementById("bst-msg");
    const input = document.getElementById("bst-value");

    function draw(marks) {
        document.getElementById("bst-size").textContent = size;
        document.getElementById("bst-height").textContent = treeHeight(root);
        document.getElementById("bst-empty").hidden = root !== null;
        drawTree(svg, root, marks);
    }

    function clearTree() {
        root = null;
        size = 0;
    }

    // Walk down from the root and hang the new value where the search "falls off".
    // Returns { added, node, path } where path lists the turns taken.
    // Duplicates are not added: node is then the one that already holds the value.
    function addValue(value) {
        const path = [];
        let parent = null;
        let current = root;
        while (current !== null) {
            if (value === current.value) return { added: false, node: current, path: path };
            const side = value < current.value ? "left" : "right";
            path.push(`${side} of ${current.value}`);
            parent = current;
            current = current[side];
        }
        const node = { id: nextId++, value: value, left: null, right: null };
        if (parent === null) root = node;
        else if (value < parent.value) parent.left = node;
        else parent.right = node;
        size++;
        return { added: true, node: node, path: path };
    }

    // Remove a node, given the node and its parent (null for the root).
    // Only used for nodes with at most one child: that child takes its place.
    function unlink(node, parent) {
        const child = node.left !== null ? node.left : node.right;
        if (parent === null) root = child;
        else if (parent.left === node) parent.left = child;
        else parent.right = child;
        size--;
    }

    // Read a number that the visitor must type (search and delete).
    function requiredValue(action) {
        if (root === null) {
            msg.textContent = `The tree is empty, so there is nothing to ${action}.`;
            return null;
        }
        if (input.value.trim() === "") {
            msg.textContent = `Type the number you want to ${action}, then press ${action}.`;
            return null;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return null;
        }
        return read.value;
    }

    function insert() {
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        // A random pick should not collide with a value already in the tree.
        if (read.random) {
            const used = inorderNodes(root).map(function (n) { return n.value; });
            while (used.includes(read.value)) read.value = Math.floor(Math.random() * 99) + 1;
        }
        const exists = inorderNodes(root).some(function (n) { return n.value === read.value; });
        if (!exists && size >= MAX) {
            msg.textContent = `The tree is full (${MAX} nodes max here). Delete a value or press Reset.`;
            return;
        }
        input.value = "";
        const result = addValue(read.value);
        const picked = read.random ? `No number typed, so I picked ${read.value}. ` : "";
        if (!result.added) {
            msg.textContent = `${read.value} is already in the tree. This tree doesn't keep duplicates.`;
        } else if (result.path.length === 0) {
            msg.textContent = `${picked}${read.value} is the first value, so it becomes the root.`;
        } else {
            msg.textContent = `${picked}Inserted ${read.value}: went ${result.path.join(", then ")}.`;
        }
        draw({ [result.node.id]: "found" });
    }

    function setAnimating(on) {
        animating = on;
        setDisabled(BUSY, on);
    }

    // Start an animation and return its run token.
    function begin() {
        setAnimating(true);
        return runner.start();
    }

    // Show one animation step, then wait. Returns false if cancelled.
    async function step(token, marks, text) {
        draw(marks);
        msg.textContent = text;
        await sleep(STEP_MS);
        return runner.alive(token);
    }

    function finish(marks, text) {
        draw(marks);
        msg.textContent = text;
        setAnimating(false);
    }

    // Animate the search path for a value.
    // Returns { node, parent, marks, checked }, with node null if not found,
    // or returns null if the animation was cancelled.
    async function followPath(token, value) {
        const marks = {};
        let parent = null;
        let current = root;
        let checked = 0;
        while (current !== null) {
            checked++;
            marks[current.id] = "current";
            if (value === current.value) {
                return { node: current, parent: parent, marks: marks, checked: checked };
            }
            const side = value < current.value ? "left" : "right";
            const word = value < current.value ? "smaller" : "bigger";
            if (!await step(token, marks, `At ${current.value}: ${value} is ${word}, so go ${side}.`)) return null;
            marks[current.id] = "visited";
            parent = current;
            current = current[side];
        }
        return { node: null, parent: parent, marks: marks, checked: checked };
    }

    async function search() {
        const value = requiredValue("search");
        if (value === null) return;
        const token = begin();
        const result = await followPath(token, value);
        if (result === null) return;
        const nodes = `${result.checked} node${result.checked === 1 ? "" : "s"}`;
        if (result.node) {
            result.marks[result.node.id] = "found";
            finish(result.marks, `Found ${value} after checking ${nodes} out of ${size}.`);
        } else {
            finish(result.marks, `Nowhere left to go. ${value} is not in the tree. Checked ${nodes} out of ${size}.`);
        }
    }

    // The smallest value is as far left as you can go; the largest, as far right.
    async function findEnd(side, name) {
        if (root === null) {
            msg.textContent = `The tree is empty, so it has no ${name}.`;
            return;
        }
        const token = begin();
        const marks = {};
        let current = root;
        while (current[side] !== null) {
            marks[current.id] = "current";
            if (!await step(token, marks, `At ${current.value}: there is a ${side} child, so go ${side}.`)) return;
            marks[current.id] = "visited";
            current = current[side];
        }
        marks[current.id] = "found";
        finish(marks, `${current.value} has no ${side} child, so it is the ${name}.`);
    }

    async function remove() {
        const value = requiredValue("delete");
        if (value === null) return;
        const token = begin();
        const result = await followPath(token, value);
        if (result === null) return;
        const node = result.node;
        const marks = result.marks;
        if (node === null) {
            finish(marks, `${value} is not in the tree, so nothing was deleted.`);
            return;
        }

        if (node.left === null || node.right === null) {
            // Case 1 (leaf) and case 2 (one child).
            const child = node.left || node.right;
            const plan = child
                ? `Found ${value}. It has one child (${child.value}), which will move up into its place.`
                : `Found ${value}. It is a leaf (no children), so it can simply be removed.`;
            if (!await step(token, marks, plan)) return;
            unlink(node, result.parent);
            input.value = "";
            finish({}, child
                ? `Deleted ${value}. Its child ${child.value} took its place.`
                : `Deleted the leaf ${value}.`);
            return;
        }

        // Case 3: two children. Replace the value with the next one in sorted
        // order (the smallest value in the right subtree), then remove that node.
        marks[node.id] = "found";
        if (!await step(token, marks, `Found ${value}. It has two children. Look for the next bigger value: go right once, then left as far as possible.`)) return;
        let parent = node;
        let next = node.right;
        while (next.left !== null) {
            marks[next.id] = "current";
            if (!await step(token, marks, `At ${next.value}: keep going left.`)) return;
            marks[next.id] = "visited";
            parent = next;
            next = next.left;
        }
        marks[next.id] = "current";
        if (!await step(token, marks, `${next.value} is the next bigger value. It will replace ${value}.`)) return;
        // "next" has no left child, so removing it is one of the easy cases.
        unlink(next, parent);
        node.value = next.value;
        input.value = "";
        finish({ [node.id]: "found" }, `Deleted ${value}. ${next.value} moved into its place, and the tree is still in order.`);
    }

    // In-order traversal of a BST visits the values from smallest to largest.
    async function inorder() {
        if (root === null) {
            msg.textContent = "The tree is empty. Insert a value or press Random fill first.";
            return;
        }
        const token = begin();
        const marks = {};
        const seen = [];
        for (const node of inorderNodes(root)) {
            marks[node.id] = "current";
            seen.push(node.value);
            if (!await step(token, marks, `In-order (left, node, right): ${seen.join(", ")}`)) return;
            marks[node.id] = "visited";
        }
        finish(marks, `In-order finished. The values come out sorted: ${seen.join(", ")}`);
    }

    function randomFill() {
        clearTree();
        const count = 7 + Math.floor(Math.random() * 6); // 7 to 12 nodes
        while (size < count) {
            addValue(Math.floor(Math.random() * 99) + 1);
        }
        msg.textContent = `Built a new tree with ${count} random numbers. Smaller values went left, bigger ones right.`;
        draw();
    }

    // The worst case: sorted input makes every new value go right.
    async function insertSorted() {
        clearTree();
        const token = begin();
        for (let value = 1; value <= 7; value++) {
            const result = addValue(value);
            const text = value === 1
                ? "Inserting 1 to 7 in order. 1 becomes the root."
                : `${value} is bigger than everything so far, so it goes right again.`;
            if (!await step(token, { [result.node.id]: "found" }, text)) return;
        }
        finish({}, "The tree has become a straight line: 7 nodes, height 7. Searching it is like searching a linked list, O(n).");
    }

    function stop() {
        runner.cancel();
        setAnimating(false);
        draw();
    }

    function reset() {
        clearTree();
        input.value = "";
        stop();
        msg.textContent = "Fresh start. The tree is empty. Insert a value or press Random fill.";
    }

    document.getElementById("bst-insert").onclick = insert;
    document.getElementById("bst-search").onclick = search;
    document.getElementById("bst-delete").onclick = remove;
    document.getElementById("bst-min").onclick = function () { findEnd("left", "minimum"); };
    document.getElementById("bst-max").onclick = function () { findEnd("right", "maximum"); };
    document.getElementById("bst-inorder").onclick = inorder;
    document.getElementById("bst-random").onclick = randomFill;
    document.getElementById("bst-sorted").onclick = insertSorted;
    document.getElementById("bst-reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") insert();
    });
    setupInfo("bst-info-btn", "bst-info");
    onLeavePage("bst-page", function () {
        if (animating) {
            stop();
            msg.textContent = "Animation cancelled because you left the page.";
        }
    });

    draw();
})();
