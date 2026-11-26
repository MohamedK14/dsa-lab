// Red-Black Tree page: plugs the rules (red-black-logic.js) into the shared
// tree page. There is no delete here.
setupTreePage({
    prefix: "rb",
    pageId: "red-black-page",
    insert: rbInsert,
    remove: null,
    drawOptions: {
        nodeClass: function (node) { return node.red ? "red" : "black"; },
        // R or B beside each node, so the colour isn't the only clue.
        badge: function (node) { return node.red ? "R" : "B"; }
    },
    showStats: function (tree) {
        document.getElementById("rb-black-height").textContent = blackHeight(tree.root);
    },
    sortedSummary: function (tree) {
        return `Inserted 1 to 7 in sorted order. Height is only ${treeHeight(tree.root)} (rotations: ${tree.rotations}). A plain search tree would be a straight line of height 7.`;
    }
});
