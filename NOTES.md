# DSA Lab notes

## How pages work

There is one HTML file. The home content is in `<div class="home">` and every
other page is a `<section class="page">`. Clicking a card changes the address
to `#NAME-page`. CSS in `base.css` shows the section that matches (`:target`)
and hides the home content. No JavaScript is needed to switch pages.

Every page follows the same pattern: back link, title with an (i) button and a
3-bullet info panel, one-line intro, analogy box, stats, the visual, a message
line, buttons and Reset.

## Shared code

| File | Contents |
| --- | --- |
| `js/ui.js` | `setupInfo` (the (i) button), `readNumber` (input box), `sleep`, `createRunner` (run tokens), `onLeavePage`, `setDisabled` |
| `js/tree-draw.js` | `treeHeight`, `inorderNodes`, `drawTree` |

**Run tokens.** An animation takes a number from `runner.start()`. After each
pause it checks `runner.alive(token)`. Reset, Stop and leaving the page call
`runner.cancel()`, so the old animation sees that its number is out of date and
stops without touching the page again.

**Global names.** Scripts share one global scope. The newer page scripts are
wrapped in `(function () { ... })();` so their names stay private. `array.js`
was written earlier and still uses globals (`data`, `capacity`, `next`,
`draw`, `msg`), so avoid reusing those names globally.

## Pages

### Array (`array.js`)
A dynamic array. `capacity` starts at 0 and doubles when full: 1, 2, 4, 8, 16.
The demo stops at 15 items. Popping keeps the capacity.

### Sorting (`sorting.js`, `algorithms.js`)
Each algorithm is a generator that sorts the array and `yield`s a step
(`compare`, `swap`, `move`, `pivot`, `sorted`). The page takes one step at a
time, counts it, draws the bars and waits. The speed slider works during a
sort. Reset brings back the last shuffled order, so you can compare algorithms
on the same bars.

### Stack (`stack.js`)
A JavaScript array whose end is the top. Up to 10 plates.

### Queue (`queue.js`)
A JavaScript array whose index 0 is the front. `shift()` moves every item,
which is why the info panel mentions O(n) and circular buffers. Up to 10 items.

### Linked List (`linked-list.js`)
Real node objects `{ value, next }` and a `head` pointer. There is no tail
pointer, so `push_back` walks the list. Search highlights one node at a time.
Up to 12 nodes.

### Binary Tree (`binary-tree.js`)
Node objects `{ id, value, left, right }`. Insert uses a queue to find the
first free spot level by level. Preorder, inorder and postorder are recursive;
level-order uses a queue. Up to 15 nodes. Random fill makes 7 to 12.

### Binary Search Tree (`bst.js`)
Smaller values go left, bigger go right. `followPath` animates the walk used by
search and delete. Delete handles a leaf, one child (the child moves up) and
two children (the next bigger value takes its place). The tree is only changed
at the end of the animation, so cancelling a delete leaves it as it was. Up to
15 nodes.

### Tree drawing (`tree-draw.js`)
A node's column is its position in the in-order list and its row is its depth,
so nodes never overlap, even when the tree is a straight line. On narrow
screens a big tree scrolls inside its box and follows the highlighted node.

## Choices made

- IDs on each page have a prefix (`stack-`, `queue-`, `list-`, `bt-`, `bst-`,
  `sort-`). The Array page keeps its original unprefixed IDs.
- An empty number box means "pick a random number" when adding. Search and
  delete ask you to type one. Numbers must be whole, from -999 to 999.
- Pressing Enter in a number box adds the value (push, enqueue, push_back or
  insert).
- Buttons are disabled while an animation runs. Reset (and Stop) stay enabled.
- The search tree does not store duplicates.
- "Insert sorted 1..7" and "Random fill" replace the current tree.
- Sorting uses 5 to 15 bars with values from 5 to 99.
- Quick sort uses the last value as the pivot, because it is the easiest to
  follow.
- The tagline style changed from `body>p` to `.home>p` when the home content
  was wrapped in `.home`.

## Known limitations

- Nothing is saved: reloading the page clears every structure.
- Leaving a page cancels its animation. Leaving during "Insert sorted 1..7"
  keeps the part of the tree built so far.
- During a merge, a highlighted bar may already have been overwritten. The
  message still shows the two values really being compared. Stopping merge
  sort halfway can restore the shuffled order, because some values only exist
  in its temporary copies.
- There is no pause or single-step button for animations.
- The binary tree page has no delete.
- Large trees need sideways scrolling on phones.
- Screen readers are not told when the message line changes.
- Testing was done with temporary scripts in headless Chrome (including narrow
  frames for phone widths) and Node for the sorting algorithms. The scripts are
  not in the repo. Firefox, Safari and real phones have not been tested.

## Planned next

- Red-Black tree
- AVL tree
- Graph
