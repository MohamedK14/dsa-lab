// Sorting algorithms written as generators.
//
// A generator (function*) can pause itself with "yield" and be resumed later.
// Each algorithm sorts the array it is given and yields after every
// interesting action, so the page can draw that moment and wait a bit.
//
// Every step looks like { type: ..., at: [positions] }:
//   "compare"  two values are being compared
//   "swap"     two values have just changed places
//   "move"     a value has just been written into a position
//   "pivot"    quick sort chose this position's value as the pivot
//   "sorted"   these positions now hold their final values

function swap(a, i, j) {
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}

// A list of positions from lo to hi, used to mark several as sorted at once.
function range(lo, hi) {
    const list = [];
    for (let i = lo; i <= hi; i++) list.push(i);
    return list;
}

// Bubble sort: swap neighbours that are in the wrong order. After each pass
// the biggest remaining value has "bubbled" to the end. O(n²).
function* bubbleSort(a) {
    for (let end = a.length - 1; end > 0; end--) {
        let swapped = false;
        for (let i = 0; i < end; i++) {
            yield { type: "compare", at: [i, i + 1] };
            if (a[i] > a[i + 1]) {
                swap(a, i, i + 1);
                swapped = true;
                yield { type: "swap", at: [i, i + 1] };
            }
        }
        // A pass with no swaps means everything left is already in order.
        if (!swapped) {
            yield { type: "sorted", at: range(0, end) };
            return;
        }
        yield { type: "sorted", at: [end] };
    }
    if (a.length > 0) yield { type: "sorted", at: [0] };
}

// Insertion sort: take the next value and slide it left until it fits, like
// sorting playing cards in your hand. O(n²), but fast on nearly sorted data.
function* insertionSort(a) {
    for (let i = 1; i < a.length; i++) {
        for (let j = i; j > 0; j--) {
            yield { type: "compare", at: [j - 1, j] };
            if (a[j - 1] <= a[j]) break;
            swap(a, j - 1, j);
            yield { type: "swap", at: [j - 1, j] };
        }
    }
    // Values can move until the very end, so nothing is final before now.
    yield { type: "sorted", at: range(0, a.length - 1) };
}

// Selection sort: find the smallest remaining value and put it next. O(n²),
// but it never does more than n - 1 swaps.
function* selectionSort(a) {
    for (let i = 0; i < a.length; i++) {
        let smallest = i;
        for (let j = i + 1; j < a.length; j++) {
            yield { type: "compare", at: [smallest, j] };
            if (a[j] < a[smallest]) smallest = j;
        }
        if (smallest !== i) {
            swap(a, i, smallest);
            yield { type: "swap", at: [i, smallest] };
        }
        yield { type: "sorted", at: [i] };
    }
}

// Merge sort: split in half, sort each half, then merge the two sorted halves.
// Always O(n log n), but it needs extra memory for the copies.
function* mergeSort(a, lo = 0, hi = a.length - 1) {
    if (lo >= hi) {
        if (a.length === 1) yield { type: "sorted", at: [0] };
        return;
    }
    const mid = Math.floor((lo + hi) / 2);
    yield* mergeSort(a, lo, mid);
    yield* mergeSort(a, mid + 1, hi);

    // Copy both halves, then write the values back in order.
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    const lastMerge = lo === 0 && hi === a.length - 1;
    let i = 0;
    let j = 0;
    for (let k = lo; k <= hi; k++) {
        if (i < left.length && j < right.length) {
            yield { type: "compare", at: [k, mid + 1 + j], values: [left[i], right[j]] };
        }
        if (j >= right.length || (i < left.length && left[i] <= right[j])) {
            a[k] = left[i++];
        } else {
            a[k] = right[j++];
        }
        yield { type: "move", at: [k] };
        // Only the final merge puts values in their final positions.
        if (lastMerge) yield { type: "sorted", at: [k] };
    }
}

// Quick sort: pick a pivot, move smaller values to its left and bigger ones to
// its right, then sort both sides the same way. O(n log n) on average, O(n²)
// if the pivots are bad. This version always picks the last value as pivot.
function* quickSort(a, lo = 0, hi = a.length - 1) {
    if (lo > hi) return;
    if (lo === hi) {
        yield { type: "sorted", at: [lo] };
        return;
    }
    const pivot = a[hi];
    yield { type: "pivot", at: [hi] };
    let boundary = lo; // everything before boundary is smaller than the pivot
    for (let j = lo; j < hi; j++) {
        yield { type: "compare", at: [j, hi] };
        if (a[j] < pivot) {
            if (boundary !== j) {
                swap(a, boundary, j);
                yield { type: "swap", at: [boundary, j] };
            }
            boundary++;
        }
    }
    // Put the pivot between the two groups. That is its final position.
    if (boundary !== hi) {
        swap(a, boundary, hi);
        yield { type: "swap", at: [boundary, hi] };
    }
    yield { type: "sorted", at: [boundary] };
    yield* quickSort(a, lo, boundary - 1);
    yield* quickSort(a, boundary + 1, hi);
}

const SORTS = {
    bubble: { name: "Bubble sort", run: bubbleSort },
    insertion: { name: "Insertion sort", run: insertionSort },
    selection: { name: "Selection sort", run: selectionSort },
    merge: { name: "Merge sort", run: mergeSort },
    quick: { name: "Quick sort", run: quickSort }
};

// Lets the algorithms be tested with Node. Browsers skip this.
if (typeof module !== "undefined") {
    module.exports = SORTS;
}
