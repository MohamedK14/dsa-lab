// An undirected graph and its two basic walks.
//
// The graph is stored as an adjacency list: for every node, the list of nodes
// it is connected to. Example: { names: ["A", "B"], neighbors: { A: ["B"], B: ["A"] } }

function createGraph() {
    return { names: [], neighbors: {} };
}

// Add the next lettered node (A, B, C, ...) and return its name.
function addNode(graph) {
    const name = String.fromCharCode(65 + graph.names.length);
    graph.names.push(name);
    graph.neighbors[name] = [];
    return name;
}

// Connect two nodes. Returns false if that makes no sense.
function addEdge(graph, a, b) {
    if (a === b || graph.neighbors[a].includes(b)) return false;
    // Keep each list in alphabetical order, so walks are predictable.
    graph.neighbors[a].push(b);
    graph.neighbors[a].sort();
    graph.neighbors[b].push(a);
    graph.neighbors[b].sort();
    return true;
}

// The same name for an edge whichever way round it is given.
function edgeName(a, b) {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
}

// A snapshot of a walk for the page to draw.
function walkStep(text, marks, edges, waiting, order) {
    return { text: text, marks: { ...marks }, edges: { ...edges }, waiting: waiting.slice(), order: order.slice() };
}

function walkSummary(graph, name, order) {
    const missed = graph.names.filter(function (n) { return !order.includes(n); });
    const rest = missed.length ? ` Not reachable from ${order[0]}: ${missed.join(", ")}.` : "";
    return `${name} finished. Visit order: ${order.join(" → ")}.${rest}`;
}

// Breadth-first search: visit the start, then all its neighbours, then their
// neighbours, and so on outward. A QUEUE (first in, first out) does this.
function* breadthFirst(graph, start) {
    const queue = [start];
    const seen = new Set([start]); // nodes already put in the queue
    const marks = { [start]: "waiting" };
    const edges = {};
    const order = [];
    yield walkStep(`BFS starts at ${start}. Put it in the queue.`, marks, edges, queue, order);

    while (queue.length > 0) {
        const node = queue.shift(); // take from the front
        order.push(node);
        marks[node] = "current";
        yield walkStep(`Take ${node} from the front of the queue and visit it. Order: ${order.join(", ")}.`, marks, edges, queue, order);

        const added = [];
        for (const next of graph.neighbors[node]) {
            if (seen.has(next)) continue;
            seen.add(next);
            queue.push(next); // join at the back
            marks[next] = "waiting";
            edges[edgeName(node, next)] = "used";
            added.push(next);
        }
        const text = added.length
            ? `Add ${node}'s new neighbours to the back of the queue: ${added.join(", ")}.`
            : `${node} has no new neighbours.`;
        yield walkStep(text, marks, edges, queue, order);
        marks[node] = "visited";
    }
    return walkStep(walkSummary(graph, "BFS", order), marks, edges, queue, order);
}

// Depth-first search: follow one path as far as it goes, then back up and try
// another. A STACK (last in, first out) does this.
function* depthFirst(graph, start) {
    const stack = [start]; // the end of the array is the top
    const visited = new Set();
    const cameFrom = {};
    const marks = { [start]: "waiting" };
    const edges = {};
    const order = [];
    yield walkStep(`DFS starts at ${start}. Push it on the stack.`, marks, edges, stack, order);

    while (stack.length > 0) {
        const node = stack.pop(); // take from the top
        // A node can be on the stack more than once. Only visit it once.
        if (visited.has(node)) {
            yield walkStep(`Pop ${node}. It was already visited, so skip it.`, marks, edges, stack, order);
            continue;
        }
        visited.add(node);
        order.push(node);
        marks[node] = "current";
        if (cameFrom[node]) edges[edgeName(cameFrom[node], node)] = "used";
        yield walkStep(`Pop ${node} from the top of the stack and visit it. Order: ${order.join(", ")}.`, marks, edges, stack, order);

        const unvisited = graph.neighbors[node].filter(function (n) { return !visited.has(n); });
        // Push in reverse, so the alphabetically first neighbour ends up on top.
        for (const next of unvisited.slice().reverse()) {
            stack.push(next);
            cameFrom[next] = node;
            marks[next] = "waiting";
        }
        const text = unvisited.length
            ? `Push ${node}'s unvisited neighbours: ${unvisited.join(", ")}. ${unvisited[0]} is on top.`
            : `${node} has no unvisited neighbours, so back up.`;
        yield walkStep(text, marks, edges, stack, order);
        marks[node] = "visited";
    }
    return walkStep(walkSummary(graph, "DFS", order), marks, edges, stack, order);
}
