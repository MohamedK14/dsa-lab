// AVL tree rules.
//
// Balance factor = height of the left subtree - height of the right subtree.
// An AVL tree keeps every balance factor at -1, 0 or +1. When an insert or
// delete pushes one to +2 or -2, one or two rotations repair it.

function balanceFactor(node) {
    return treeHeight(node.left) - treeHeight(node.right);
}

function signed(n) {
    return n > 0 ? `+${n}` : String(n);
}

// Repair one node whose balance factor is +2 or -2.
function* avlFix(tree, node) {
    const factor = balanceFactor(node);
    const leftHeavy = factor > 0;
    const child = leftHeavy ? node.left : node.right;
    const childFactor = balanceFactor(child);
    // "Bent" shape: the child leans the opposite way to its parent.
    const double = leftHeavy ? childFactor < 0 : childFactor > 0;

    let name;
    if (leftHeavy) name = double ? "Left-Right rotation" : "Right rotation";
    else name = double ? "Right-Left rotation" : "Left rotation";

    const tall = leftHeavy ? "left" : "right";
    yield {
        text: `${node.value} has balance factor ${signed(factor)}: its ${tall} side is 2 levels taller. Fix: ${name}.`,
        marks: { [node.id]: "current", [child.id]: "visited" }
    };

    if (double) {
        // First straighten the bend by rotating at the child.
        const first = leftHeavy ? "left" : "right";
        const top = leftHeavy ? rotateLeft(tree, child) : rotateRight(tree, child);
        yield {
            text: `${name}, step 1 of 2: rotated ${first} at ${child.value}, so ${top.value} moved up. Now the heavy side is a straight line.`,
            marks: { [node.id]: "current", [top.id]: "found" }
        };
    }

    const direction = leftHeavy ? "right" : "left";
    const top = leftHeavy ? rotateRight(tree, node) : rotateLeft(tree, node);
    const step = double ? `${name}, step 2 of 2` : name;
    yield {
        text: `${step}: rotated ${direction} at ${node.value}. ${top.value} moved up and ${node.value} became its ${direction} child.`,
        marks: { [top.id]: "found", [node.id]: "visited" }
    };
    return name;
}

// Walk back up the path (deepest node first) and repair what is unbalanced.
// Returns the names of the rotations used.
function* avlRebalance(tree, path) {
    const used = [];
    for (let i = path.length - 1; i >= 0; i--) {
        if (Math.abs(balanceFactor(path[i])) > 1) {
            used.push(yield* avlFix(tree, path[i]));
        }
    }
    return used;
}

function describeRepairs(used) {
    if (used.length === 0) return "Every balance factor is still -1, 0 or +1, so no rotation was needed.";
    return `Balanced again using: ${used.join(", then ")}.`;
}

function* avlInsert(tree, value) {
    const path = []; // the nodes passed on the way down
    let current = tree.root;
    while (current !== null) {
        if (value === current.value) {
            return { text: `${value} is already in the tree. This tree doesn't keep duplicates.`, marks: { [current.id]: "found" } };
        }
        path.push(current);
        current = value < current.value ? current.left : current.right;
    }

    const node = createNode(tree, value);
    if (path.length === 0) {
        tree.root = node;
        return { text: `${value} is the first value, so it becomes the root.`, marks: { [node.id]: "found" } };
    }
    const parent = path[path.length - 1];
    const side = value < parent.value ? "left" : "right";
    parent[side] = node;
    yield {
        text: `Inserted ${value} as the ${side} child of ${parent.value}. Now check the balance factors on the way back up.`,
        marks: { [node.id]: "found" }
    };

    const used = yield* avlRebalance(tree, path);
    return { text: `Inserted ${value}. ${describeRepairs(used)}`, marks: { [node.id]: "found" } };
}

function* avlDelete(tree, value) {
    const path = [];
    const marks = {};
    let node = tree.root;
    while (node !== null && node.value !== value) {
        const side = value < node.value ? "left" : "right";
        marks[node.id] = "current";
        yield { text: `At ${node.value}: look for ${value} on the ${side}.`, marks: marks };
        marks[node.id] = "visited";
        path.push(node);
        node = node[side];
    }
    if (node === null) {
        return { text: `${value} is not in the tree, so nothing was deleted.`, marks: marks };
    }

    marks[node.id] = "current";
    if (node.left !== null && node.right !== null) {
        // Two children: the next bigger value takes this node's place.
        path.push(node);
        let next = node.right;
        while (next.left !== null) {
            path.push(next);
            next = next.left;
        }
        marks[next.id] = "found";
        yield { text: `${value} has two children. The next bigger value, ${next.value}, will take its place.`, marks: marks };
        replaceChild(tree, path[path.length - 1], next, next.right);
        node.value = next.value;
        tree.size--;
        yield { text: `${node.value} moved up. Now check the balance factors on the way back up.`, marks: { [node.id]: "found" } };
    } else {
        const child = node.left || node.right;
        yield {
            text: child ? `${value} has one child, ${child.value}, which will move up.` : `${value} is a leaf, so it can simply be removed.`,
            marks: marks
        };
        replaceChild(tree, path.length ? path[path.length - 1] : null, node, child);
        tree.size--;
        yield { text: `Removed ${value}. Now check the balance factors on the way back up.`, marks: {} };
    }

    const used = yield* avlRebalance(tree, path);
    return { text: `Deleted ${value}. ${describeRepairs(used)}`, marks: {} };
}
