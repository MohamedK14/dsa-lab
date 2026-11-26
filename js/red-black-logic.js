// Red-Black tree rules (insert only).
//
// The 5 rules:
//   1. Every node is red or black.
//   2. The root is black.
//   3. Empty spots (missing children) count as black.
//   4. A red node never has a red child.
//   5. Every path from a node down to an empty spot passes the same number
//      of black nodes.
//
// A new node is red, so rule 5 still holds. The only possible problems are a
// red root (rule 2) or a red child under a red parent (rule 4).

function isRed(node) {
    return node !== null && node.red;
}

// Number of black nodes on a path from the root down. By rule 5 every path
// gives the same answer, so we just follow the left side.
function blackHeight(node) {
    let count = 0;
    while (node !== null) {
        if (!node.red) count++;
        node = node.left;
    }
    return count;
}

function* rbInsert(tree, value) {
    let parent = null;
    let current = tree.root;
    while (current !== null) {
        if (value === current.value) {
            return { text: `${value} is already in the tree. This tree doesn't keep duplicates.`, marks: { [current.id]: "found" } };
        }
        parent = current;
        current = value < current.value ? current.left : current.right;
    }

    let node = createNode(tree, value);
    node.red = true;
    const added = node;
    const done = function (text) {
        return { text: text, marks: { [added.id]: "found" } };
    };

    if (parent === null) {
        tree.root = node;
        yield { text: `${value} is the first value. New nodes start red.`, marks: { [node.id]: "current" } };
        node.red = false;
        return done(`Case "root": the root must be black, so ${value} was recoloured black.`);
    }

    const side = value < parent.value ? "left" : "right";
    parent[side] = node;
    yield {
        text: `Inserted ${value} as a red ${side} child of ${parent.value}. A red node doesn't change any black counts.`,
        marks: { [node.id]: "found" }
    };
    if (!parent.red) {
        return done(`Inserted ${value}. Case "black parent": no rule is broken, so there is nothing to fix.`);
    }

    const used = []; // names of the cases we went through
    // Repeat while there are two reds in a row.
    while (isRed(parentOf(tree, node))) {
        parent = parentOf(tree, node);
        const grand = parentOf(tree, parent); // exists, because a red parent is never the root
        const parentIsLeft = grand.left === parent;
        const uncle = parentIsLeft ? grand.right : grand.left;

        if (isRed(uncle)) {
            used.push("red uncle (recolour)");
            const marks = { [node.id]: "current", [parent.id]: "current", [uncle.id]: "visited" };
            yield {
                text: `Case "red uncle": ${node.value} and its parent ${parent.value} are both red, and uncle ${uncle.value} is red too. Recolour.`,
                marks: marks
            };
            parent.red = false;
            uncle.red = false;
            grand.red = true;
            yield {
                text: `Recoloured: ${parent.value} and ${uncle.value} are now black, grandparent ${grand.value} is red. Next, check ${grand.value}.`,
                marks: { [grand.id]: "current" }
            };
            node = grand; // the problem may have moved up two levels
            continue;
        }

        const uncleName = uncle ? `uncle ${uncle.value} is black` : "the uncle spot is empty (black)";
        const nodeIsLeft = parent.left === node;
        if (nodeIsLeft !== parentIsLeft) {
            // Triangle: grandparent, parent and node form a bend.
            const turn = parentIsLeft ? "left" : "right";
            used.push(`triangle (rotate ${turn})`);
            yield {
                text: `Case "triangle": two reds in a row, ${uncleName}, and ${node.value} is on the inner side. Rotate ${turn} at ${parent.value}.`,
                marks: { [node.id]: "current", [parent.id]: "current" }
            };
            if (parentIsLeft) rotateLeft(tree, parent);
            else rotateRight(tree, parent);
            yield {
                text: `Rotated ${turn} at ${parent.value}. ${node.value} moved up, and the three nodes now form a straight line.`,
                marks: { [node.id]: "current", [parent.id]: "current" }
            };
            // The two nodes swapped roles.
            const lower = parent;
            parent = node;
            node = lower;
        }

        // Line: one rotation at the grandparent finishes the job.
        const turn = parentIsLeft ? "right" : "left";
        used.push(`line (rotate ${turn})`);
        yield {
            text: `Case "line": two reds in a row in a straight line, ${uncleName}. Recolour ${parent.value} black and ${grand.value} red, then rotate ${turn} at ${grand.value}.`,
            marks: { [node.id]: "current", [parent.id]: "current", [grand.id]: "visited" }
        };
        parent.red = false;
        grand.red = true;
        yield {
            text: `Recoloured: ${parent.value} is black and ${grand.value} is red. Now rotate ${turn}.`,
            marks: { [parent.id]: "current", [grand.id]: "visited" }
        };
        if (parentIsLeft) rotateRight(tree, grand);
        else rotateLeft(tree, grand);
        yield {
            text: `Rotated ${turn} at ${grand.value}. ${parent.value} moved up and has two red children.`,
            marks: { [parent.id]: "found" }
        };
    }

    if (tree.root.red) {
        used.push("root (recolour black)");
        yield { text: `Case "root": the red colour reached the root ${tree.root.value}.`, marks: { [tree.root.id]: "current" } };
        tree.root.red = false;
        yield { text: `The root must be black, so ${tree.root.value} was recoloured black.`, marks: { [tree.root.id]: "found" } };
    }

    return done(`Inserted ${value}. All 5 rules hold again. Cases used: ${used.join(", then ")}.`);
}
