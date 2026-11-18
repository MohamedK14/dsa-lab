const facts = [
    "Reading an array item by index is instant (O(1)), because the computer can jump straight to the slot's address.",
    "In a real array, a removed slot isn't erased, just ignored. The old value stays in memory until something overwrites it.",
    "Doubling an array's capacity makes push_back cheap on average, even though a single resize copies everything.",
    "Stacks power the undo button. Every action is pushed, and undo pops the latest one.",
    "Every function call is pushed onto the call stack. Too many nested calls cause a stack overflow.",
    "A print queue is first in, first out: the first document sent is the first one printed.",
    "Merge sort always takes O(n log n), but it needs extra memory to merge.",
    "Quick sort is usually the fastest in practice, but with bad pivots its worst case is O(n²)."
];
