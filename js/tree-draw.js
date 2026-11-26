// Shared by the Binary Tree and Binary Search Tree pages.
// A tree node looks like: { id: 1, value: 42, left: null, right: null }

// Number of levels in the tree. An empty tree has height 0.
function treeHeight(node) {
    if (node === null) return 0;
    return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

// In-order list of nodes: left subtree, then the node, then right subtree.
function inorderNodes(node, list) {
    list = list || [];
    if (node !== null) {
        inorderNodes(node.left, list);
        list.push(node);
        inorderNodes(node.right, list);
    }
    return list;
}

// Draw a tree into an <svg>.
// marks (optional) maps a node id to a CSS class: "current", "visited" or "found".
//
// Layout idea: a node's column is its position in the in-order list, and its
// row is its depth. Two nodes never share a column, so they can't overlap.
function drawTree(svg, root, marks) {
    marks = marks || {};
    const COL = 40; // horizontal space per node
    const ROW = 58; // vertical space per level
    const R = 17;   // circle radius

    const order = inorderNodes(root);
    const width = Math.max(order.length * COL, 360);
    const height = Math.max(treeHeight(root) * ROW, ROW);
    const offset = (width - order.length * COL) / 2; // centres small trees

    const pos = {};
    order.forEach(function (node, i) {
        pos[node.id] = { x: offset + i * COL + COL / 2 };
    });

    let lines = "";
    let circles = "";
    function walk(node, depth) {
        if (node === null) return;
        const x = pos[node.id].x;
        const y = depth * ROW + ROW / 2;
        [node.left, node.right].forEach(function (child) {
            if (child === null) return;
            lines += `<line class="tree-edge" x1="${x}" y1="${y}" x2="${pos[child.id].x}" y2="${y + ROW}"/>`;
        });
        const cls = marks[node.id] ? ` ${marks[node.id]}` : "";
        circles += `<g class="tree-node${cls}"><circle cx="${x}" cy="${y}" r="${R}"/>`;
        circles += `<text x="${x}" y="${y}">${node.value}</text></g>`;
        walk(node.left, depth + 1);
        walk(node.right, depth + 1);
    }
    walk(root, 0);

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    // Never larger than its natural size, and never squeezed so small that the
    // numbers become unreadable (the box around it scrolls instead).
    svg.style.maxWidth = `${width}px`;
    svg.style.minWidth = `${Math.min(Math.round(width * 0.75), 440)}px`;
    // Lines first so the circles are drawn on top of them.
    svg.innerHTML = lines + circles;
    keepInView(svg, root);
}

// On narrow screens a big tree scrolls sideways inside its box. Scroll so the
// highlighted node (or the root, if nothing is highlighted) stays visible.
function keepInView(svg, root) {
    const box = svg.parentElement;
    if (root === null || box.scrollWidth <= box.clientWidth) return;
    const focus = svg.querySelector(".current, .found") || svg.querySelector(".tree-node");
    // When nothing is highlighted the first .tree-node drawn is the root.
    const nodeRect = focus.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    box.scrollLeft += nodeRect.left + nodeRect.width / 2 - (boxRect.left + boxRect.width / 2);
}
