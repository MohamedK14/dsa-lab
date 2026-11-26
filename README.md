# DSA Lab

A small website for learning data structures by doing. Press buttons, watch the
structure change, and read a plain-language message about what just happened.

It is plain HTML, CSS and JavaScript: no libraries and no build step.

## Pages

| Page | What you can do |
| --- | --- |
| Array | push_back, pop_back, watch the capacity double |
| Sorting | Animate bubble, insertion, selection, merge and quick sort |
| Stack | push, pop, top |
| Queue | enqueue, dequeue, front |
| Linked List | push_front, push_back, pop_front, step-by-step search |
| Binary Tree | Insert level by level, run four traversals |
| Binary Search Tree | insert, search, delete, min, max, in-order, worst-case demo |
| AVL Tree | insert, search, delete, watch each rotation |
| Red-Black Tree | insert and search, watch recolouring and rotations |
| Graph | Add nodes and edges, run BFS and DFS |

The home page also has a "Did you know?" box with random facts and a short
story about the first computer bug.

## How to run

Open `index.html` in a recent browser (Chrome, Edge, Firefox or Safari). That's
all. The page needs the CSS `:has()` selector, so very old browsers will not
show and hide pages correctly.

## File map

```
index.html            All pages. Each one is a <section class="page">.

css/base.css          Shared styles: page switching, buttons, inputs, info
                      panel, analogy box, messages, tree drawings
css/home.css          Home page cards, "Did you know?" and "Story time" boxes
css/<page>.css        Styles for one page (array, stack, queue, linked-list,
                      binary-tree, bst, avl, red-black, graph, sorting)

js/facts.js           The list of fun facts
js/home.js            Shows a random fact
js/ui.js              Shared helpers: info button, number input, animation
                      pauses and cancelling
js/tree-draw.js       Draws a tree as SVG (used by all tree pages)
js/tree-ops.js        Rotations and search for the self-balancing trees
js/tree-page.js       Buttons and animation for the AVL and Red-Black pages
js/avl-logic.js       AVL insert, delete and rebalancing
js/red-black-logic.js Red-Black insert
js/graph-logic.js     Graph storage, BFS and DFS
js/algorithms.js      The five sorting algorithms, written as generators
js/<page>.js          Behaviour of one page (array, stack, queue, linked-list,
                      binary-tree, bst, avl, red-black, graph, sorting)

NOTES.md              How the code works, choices made, limitations, plans
```

## Adding a page

1. Add `<section id="NAME-page" class="page">` to `index.html`, with a
   "← All structures" link (`href="#"`).
2. Add a card on the home page with `href="#NAME-page"`.
3. Create `css/NAME.css` and `js/NAME.js` and link them in `index.html`.

Showing and hiding is handled by `css/base.css`. Load `js/ui.js` before any
page script that uses its helpers.
