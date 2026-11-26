// AVL Tree page: plugs the AVL rules (avl-logic.js) into the shared tree page.
setupTreePage({
    prefix: "avl",
    pageId: "avl-page",
    insert: avlInsert,
    remove: avlDelete,
    drawOptions: {
        // The small number beside each node is its balance factor.
        badge: function (node) { return signed(balanceFactor(node)); }
    },
    sortedSummary: function (tree) {
        return `Inserted 1 to 7 in sorted order. Height is only ${treeHeight(tree.root)} (rotations: ${tree.rotations}). A plain search tree would be a straight line of height 7.`;
    }
});
