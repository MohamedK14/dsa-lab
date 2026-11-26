// Binary Tree page.
// Each node has at most two children: left and right. This page keeps the tree
// "complete": new values fill the first free spot, level by level.
(function () {
    const MAX = 15; // four full levels
    const STEP_MS = 700; // pause between traversal steps
    const BUSY = ["bt-value", "bt-insert", "bt-random", "bt-preorder", "bt-inorder", "bt-postorder", "bt-levelorder"];

    let root = null;
    let size = 0;
    let nextId = 1;
    let animating = false;
    const runner = createRunner();

    const svg = document.getElementById("bt-svg");
    const msg = document.getElementById("bt-msg");
    const input = document.getElementById("bt-value");

    function draw(marks) {
        document.getElementById("bt-size").textContent = size;
        document.getElementById("bt-height").textContent = treeHeight(root);
        document.getElementById("bt-empty").hidden = root !== null;
        drawTree(svg, root, marks);
    }

    // Put a new node in the first free spot. We look at nodes level by level
    // using a queue: take one from the front, add its children to the back.
    // Returns a short description of where the node went.
    function addValue(value) {
        const node = { id: nextId++, value: value, left: null, right: null };
        size++;
        if (root === null) {
            root = node;
            return { node: node, where: "It is the root, the top of the tree." };
        }
        const waiting = [root];
        while (waiting.length > 0) {
            const parent = waiting.shift();
            if (parent.left === null) {
                parent.left = node;
                return { node: node, where: `It became the left child of ${parent.value}.` };
            }
            if (parent.right === null) {
                parent.right = node;
                return { node: node, where: `It became the right child of ${parent.value}.` };
            }
            waiting.push(parent.left, parent.right);
        }
    }

    function insert() {
        if (size >= MAX) {
            msg.textContent = `The tree is full (${MAX} nodes max here). Press Reset to start again.`;
            return;
        }
        const read = readNumber(input);
        if (read === null) {
            msg.textContent = "Please type a whole number from -999 to 999.";
            return;
        }
        input.value = "";
        const picked = read.random ? `No number typed, so I picked ${read.value}. ` : "";
        const added = addValue(read.value);
        msg.textContent = `${picked}Inserted ${read.value} in the first free spot. ${added.where}`;
        draw({ [added.node.id]: "found" });
    }

    function randomFill() {
        root = null;
        size = 0;
        const count = 7 + Math.floor(Math.random() * 6); // 7 to 12 nodes
        for (let i = 0; i < count; i++) {
            addValue(Math.floor(Math.random() * 99) + 1);
        }
        msg.textContent = `Built a new tree with ${count} random numbers, filled level by level. Try a traversal.`;
        draw();
    }

    // The three depth-first orders differ only in WHEN the node itself is
    // visited: before its children, between them, or after them.
    function preorder(node, list) {
        if (node === null) return list;
        list.push(node);
        preorder(node.left, list);
        preorder(node.right, list);
        return list;
    }

    function postorder(node, list) {
        if (node === null) return list;
        postorder(node.left, list);
        postorder(node.right, list);
        list.push(node);
        return list;
    }

    // Level-order (breadth-first) uses a queue instead of recursion.
    function levelorder(node) {
        const list = [];
        const waiting = node ? [node] : [];
        while (waiting.length > 0) {
            const current = waiting.shift();
            list.push(current);
            if (current.left) waiting.push(current.left);
            if (current.right) waiting.push(current.right);
        }
        return list;
    }

    function setAnimating(on) {
        animating = on;
        setDisabled(BUSY, on);
    }

    // Highlight the nodes one at a time, in the order given.
    async function play(name, rule, nodes) {
        if (root === null) {
            msg.textContent = "The tree is empty. Insert a value or press Random fill first.";
            return;
        }
        const token = runner.start();
        setAnimating(true);
        const marks = {};
        const seen = [];
        for (const node of nodes) {
            marks[node.id] = "current";
            seen.push(node.value);
            draw(marks);
            msg.textContent = `${name} (${rule}). Visited so far: ${seen.join(", ")}`;
            await sleep(STEP_MS);
            if (!runner.alive(token)) return; // cancelled by Reset or leaving
            marks[node.id] = "visited";
        }
        draw(marks);
        msg.textContent = `${name} finished. Visit order: ${seen.join(", ")}`;
        setAnimating(false);
    }

    function stop() {
        runner.cancel();
        setAnimating(false);
        draw();
    }

    function reset() {
        root = null;
        size = 0;
        input.value = "";
        stop();
        msg.textContent = "Fresh start. The tree is empty. Insert a value or press Random fill.";
    }

    document.getElementById("bt-insert").onclick = insert;
    document.getElementById("bt-random").onclick = randomFill;
    document.getElementById("bt-preorder").onclick = function () {
        play("Preorder", "node, left, right", preorder(root, []));
    };
    document.getElementById("bt-inorder").onclick = function () {
        play("Inorder", "left, node, right", inorderNodes(root));
    };
    document.getElementById("bt-postorder").onclick = function () {
        play("Postorder", "left, right, node", postorder(root, []));
    };
    document.getElementById("bt-levelorder").onclick = function () {
        play("Level-order", "top to bottom, left to right", levelorder(root));
    };
    document.getElementById("bt-reset").onclick = reset;
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") insert();
    });
    setupInfo("bt-info-btn", "bt-info");
    onLeavePage("binary-tree-page", function () {
        if (animating) {
            stop();
            msg.textContent = "Traversal cancelled because you left the page.";
        }
    });

    draw();
})();
