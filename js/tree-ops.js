// Tree operations shared by the AVL and Red-Black pages.
//
// A tree is { root, size, nextId, rotations }.
// A node is { id, value, left, right } (Red-Black nodes also have "red").
//
// Operations that are shown step by step are generators (function*). Each
// "yield" hands the page one step: { text, marks }. The final "return" hands
// over the last message in the same shape. All changes to the tree happen
// inside the generator, between two yields.

function createTree() {
    return { root: null, size: 0, nextId: 1, rotations: 0 };
}

function createNode(tree, value) {
    tree.size++;
    return { id: tree.nextId++, value: value, left: null, right: null };
}

// The parent of a node, or null if the node is the root.
function parentOf(tree, target) {
    let parent = null;
    let current = tree.root;
    while (current !== null && current !== target) {
        parent = current;
        current = target.value < current.value ? current.left : current.right;
    }
    return parent;
}

// Make "parent" point to newChild where it used to point to oldChild.
function replaceChild(tree, parent, oldChild, newChild) {
    if (parent === null) tree.root = newChild;
    else if (parent.left === oldChild) parent.left = newChild;
    else parent.right = newChild;
}

// Rotate left at "node": its right child moves up, and "node" becomes that
// child's left child. The sorted order of the values does not change.
//
//      node                child
//     /    \              /     \
//    A     child   =>   node     C
//         /     \      /    \
//        B       C    A      B
function rotateLeft(tree, node) {
    const parent = parentOf(tree, node);
    const child = node.right;
    node.right = child.left;
    child.left = node;
    replaceChild(tree, parent, node, child);
    tree.rotations++;
    return child;
}

// The mirror image: the left child moves up.
function rotateRight(tree, node) {
    const parent = parentOf(tree, node);
    const child = node.left;
    node.left = child.right;
    child.right = node;
    replaceChild(tree, parent, node, child);
    tree.rotations++;
    return child;
}

// Ordinary search tree lookup, shown one node at a time.
function* searchSteps(tree, value) {
    const marks = {};
    let current = tree.root;
    let checked = 0;
    while (current !== null) {
        checked++;
        const count = `${checked} node${checked === 1 ? "" : "s"}`;
        if (value === current.value) {
            marks[current.id] = "found";
            return { text: `Found ${value} after checking ${count} out of ${tree.size}.`, marks: marks };
        }
        const side = value < current.value ? "left" : "right";
        const word = value < current.value ? "smaller" : "bigger";
        marks[current.id] = "current";
        yield { text: `At ${current.value}: ${value} is ${word}, so go ${side}.`, marks: marks };
        marks[current.id] = "visited";
        current = current[side];
    }
    return { text: `Nowhere left to go. ${value} is not in the tree.`, marks: marks };
}
