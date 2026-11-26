// Graph page. The graph and its walks are in graph-logic.js; this file draws
// them and handles the buttons.
(function () {
    const MAX = 10;
    const STEP_MS = 750; // pause between walk steps
    const BUSY = ["graph-add-node", "graph-from", "graph-to", "graph-add-edge", "graph-start", "graph-bfs", "graph-dfs", "graph-random"];

    let graph = createGraph();
    let walking = false;
    const runner = createRunner();

    const get = function (id) { return document.getElementById(id); };
    const msg = get("graph-msg");

    // Nodes sit evenly around a circle. A straight line between two points on a
    // circle never passes through a third one, so edges don't hide nodes.
    function position(index) {
        const count = graph.names.length;
        if (count === 1) return { x: 180, y: 180 };
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        return { x: 180 + 145 * Math.cos(angle), y: 180 + 145 * Math.sin(angle) };
    }

    // state (optional) is one step of a walk.
    function draw(state) {
        const marks = state ? state.marks : {};
        const used = state ? state.edges : {};
        let lines = "";
        let circles = "";
        let edgeCount = 0;
        graph.names.forEach(function (name, i) {
            const from = position(i);
            graph.neighbors[name].forEach(function (other) {
                if (other < name) return; // draw each edge once
                edgeCount++;
                const to = position(graph.names.indexOf(other));
                const cls = used[edgeName(name, other)] || "";
                lines += `<line class="graph-edge ${cls}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"/>`;
            });
            circles += `<g class="graph-node ${marks[name] || ""}"><circle cx="${from.x}" cy="${from.y}" r="20"/>`;
            circles += `<text x="${from.x}" y="${from.y}">${name}</text></g>`;
        });
        get("graph-svg").innerHTML = lines + circles;
        get("graph-empty").hidden = graph.names.length > 0;
        get("graph-nodes").textContent = graph.names.length;
        get("graph-edges").textContent = edgeCount;
    }

    // The queue or stack shown beside the drawing.
    function drawWaiting(kind, state) {
        get("graph-waiting-title").textContent = kind === "stack" ? "Stack (top first)"
            : kind === "queue" ? "Queue (front first)" : "Queue or stack";
        // The top of the stack is the end of its array, so show it reversed.
        const items = !state ? [] : kind === "stack" ? state.waiting.slice().reverse() : state.waiting;
        get("graph-waiting").innerHTML = items.length
            ? items.map(function (n) { return `<li>${n}</li>`; }).join("")
            : `<li class="empty">${state ? "empty" : "Run BFS or DFS"}</li>`;
        get("graph-order").textContent = state && state.order.length ? state.order.join(", ") : "none";
    }

    // Fill the three drop-down lists, keeping the current choices if possible.
    function updateChoices() {
        [["graph-from", 0], ["graph-to", 1], ["graph-start", 0]].forEach(function ([id, fallback]) {
            const select = get(id);
            const previous = select.value;
            select.innerHTML = graph.names.map(function (n) { return `<option>${n}</option>`; }).join("");
            if (graph.names.includes(previous)) select.value = previous;
            else if (graph.names.length) select.value = graph.names[Math.min(fallback, graph.names.length - 1)];
        });
    }

    // Redraw everything after the graph itself changed.
    function changed() {
        updateChoices();
        draw();
        drawWaiting();
    }

    function addNodeClicked() {
        if (graph.names.length >= MAX) {
            msg.textContent = `The graph is full (${MAX} nodes max here). Press Reset to start again.`;
            return;
        }
        const name = addNode(graph);
        changed();
        // Suggest connecting the new node.
        if (graph.names.length > 1) get("graph-to").value = name;
        msg.textContent = `Added node ${name}. It has no edges yet.`;
    }

    function addEdgeClicked() {
        if (graph.names.length < 2) {
            msg.textContent = "Add at least two nodes first.";
            return;
        }
        const a = get("graph-from").value;
        const b = get("graph-to").value;
        if (a === b) {
            msg.textContent = "Pick two different nodes to connect.";
        } else if (!addEdge(graph, a, b)) {
            msg.textContent = `${a} and ${b} are already connected.`;
        } else {
            changed();
            msg.textContent = `Connected ${a} and ${b}. The road works in both directions.`;
        }
    }

    function randomGraph() {
        graph = createGraph();
        const count = 6 + Math.floor(Math.random() * 4); // 6 to 9 nodes
        const pick = function (limit) { return graph.names[Math.floor(Math.random() * limit)]; };
        for (let i = 0; i < count; i++) {
            const name = addNode(graph);
            // Link each new node to an earlier one, so everything is connected.
            if (i > 0) addEdge(graph, name, pick(i));
        }
        // A few extra edges make loops.
        for (let i = 0; i < Math.floor(count / 2); i++) {
            addEdge(graph, pick(count), pick(count));
        }
        changed();
        msg.textContent = `Built a random graph with ${count} nodes. Choose a start node, then press BFS or DFS.`;
    }

    function setWalking(on) {
        walking = on;
        setDisabled(BUSY, on);
    }

    async function walk(generator, kind) {
        if (graph.names.length === 0) {
            msg.textContent = "The graph is empty. Add a node or press Random graph first.";
            return;
        }
        const token = runner.start();
        const steps = generator(graph, get("graph-start").value);
        setWalking(true);
        while (true) {
            const result = steps.next();
            draw(result.value);
            drawWaiting(kind, result.value);
            msg.textContent = result.value.text;
            if (result.done) break;
            await sleep(STEP_MS);
            if (!runner.alive(token)) return; // Reset or leaving the page
        }
        setWalking(false);
    }

    // Cancel a walk and clear its highlights.
    function stop() {
        runner.cancel();
        setWalking(false);
        draw();
        drawWaiting();
    }

    function reset() {
        graph = createGraph();
        stop();
        updateChoices();
        msg.textContent = "Fresh start. The graph is empty. Add a node or press Random graph.";
    }

    get("graph-add-node").onclick = addNodeClicked;
    get("graph-add-edge").onclick = addEdgeClicked;
    get("graph-random").onclick = randomGraph;
    get("graph-bfs").onclick = function () { walk(breadthFirst, "queue"); };
    get("graph-dfs").onclick = function () { walk(depthFirst, "stack"); };
    get("graph-reset").onclick = reset;
    setupInfo("graph-info-btn", "graph-info");
    onLeavePage("graph-page", function () {
        if (walking) {
            stop();
            msg.textContent = "Search cancelled because you left the page.";
        }
    });

    changed();
})();
