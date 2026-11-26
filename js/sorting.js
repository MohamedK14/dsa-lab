// Sorting page.
// The algorithms live in algorithms.js. This file asks the chosen generator
// for one step at a time, draws it as bars, counts it, and waits a moment.
(function () {
    // Controls that must not change in the middle of a sort.
    const BUSY = ["sort-algo", "sort-count", "sort-shuffle"];

    let start = [];   // the last shuffled order, so Reset can bring it back
    let values = [];  // the array being sorted
    let done = new Set(); // positions already in their final place
    let pivotAt = null;
    let comparisons = 0;
    let moves = 0;
    let sorting = false;
    let steps = null; // the generator of the sort that is running
    const runner = createRunner();

    const bars = document.getElementById("sort-bars");
    const bufferBox = document.getElementById("sort-buffer-box");
    const bufferRow = document.getElementById("sort-buffer");
    const msg = document.getElementById("sort-msg");
    const algo = document.getElementById("sort-algo");
    const countSlider = document.getElementById("sort-count");
    const speedSlider = document.getElementById("sort-speed");
    const goButton = document.getElementById("sort-go");

    // Merge sort's temporary copies, drawn under the bars in matching columns.
    function drawBuffer(step) {
        bufferBox.hidden = algo.value !== "merge";
        const buffer = step && step.buffer;
        let html = "";
        for (let p = 0; p < values.length; p++) {
            let cell = "";
            if (buffer && p >= buffer.lo && p <= buffer.hi) {
                const isLeft = p - buffer.lo < buffer.left.length;
                const list = isLeft ? buffer.left : buffer.right;
                const n = isLeft ? p - buffer.lo : p - buffer.lo - buffer.left.length;
                const next = isLeft ? buffer.i : buffer.j;
                if (n >= next) { // values already written back leave a gap
                    let cls = "copy";
                    if (step.type === "compare" && n === next) cls += " comparing";
                    if (!isLeft && n === 0) cls += " second-half";
                    cell = `<span class="${cls}">${list[n]}</span>`;
                }
            }
            html += `<div class="bar-slot">${cell}</div>`;
        }
        bufferRow.innerHTML = html;
    }

    // Speed 1 waits 1 second per step, speed 10 waits 0.1 seconds.
    function delay() {
        return 1100 - Number(speedSlider.value) * 100;
    }

    // Draw one bar per value. "step" is the action to highlight, if any.
    function draw(step) {
        document.getElementById("sort-comparisons").textContent = comparisons;
        document.getElementById("sort-moves").textContent = moves;

        let html = "";
        for (let i = 0; i < values.length; i++) {
            let cls = "bar";
            if (done.has(i)) cls += " done";
            if (i === pivotAt) cls += " pivot";
            // During a merge these bars show old values that are about to be
            // overwritten (the real values are safe in the copies below).
            const buffer = step && step.buffer;
            if (buffer && i >= buffer.lo + buffer.i + buffer.j && i <= buffer.hi) cls += " stale";
            if (step && step.at.includes(i)) {
                if (step.type === "compare" && i !== pivotAt) cls += " comparing";
                if (step.type === "swap" || step.type === "move") cls += " moving";
            }
            // Values go from 1 to 99, so the value is also the height in percent.
            html += `<div class="bar-slot"><div class="${cls}" style="height: ${values[i]}%"><span>${values[i]}</span></div></div>`;
        }
        bars.innerHTML = html;
        drawBuffer(step);
    }

    // A sentence explaining the step.
    function describe(step) {
        const [i, j] = step.at;
        if (step.type === "compare") {
            // Merge sort compares values held in its copies, so it sends them along.
            if (step.values) return `Comparing ${step.values[0]} and ${step.values[1]} from the temporary copies.`;
            return `Comparing ${values[i]} and ${values[j]}.`;
        }
        if (step.type === "swap") return `Swapped ${values[j]} and ${values[i]}.`;
        if (step.type === "move") return `Wrote ${values[i]} into index ${i}.`;
        if (step.type === "pivot") return `${values[i]} is the pivot. Smaller values will go to its left.`;
        if (step.at.length === 1) return `${values[i]} is in its final place.`;
        return "These values are all in their final places.";
    }

    function setSorting(on) {
        sorting = on;
        setDisabled(BUSY, on);
        goButton.textContent = on ? "Stop" : "Sort";
    }

    // Forget highlights and counters (the values stay as they are).
    function clearProgress() {
        done = new Set();
        pivotAt = null;
        comparisons = 0;
        moves = 0;
    }

    function isSorted() {
        return values.every(function (v, i) { return i === 0 || values[i - 1] <= v; });
    }

    async function sort() {
        if (isSorted()) {
            msg.textContent = "These bars are already sorted. Press Shuffle for a new set.";
            return;
        }
        const chosen = SORTS[algo.value];
        const token = runner.start();
        clearProgress();
        setSorting(true);

        steps = chosen.run(values);
        for (const step of steps) {
            if (step.type === "compare") comparisons++;
            if (step.type === "swap" || step.type === "move") moves++;
            if (step.type === "pivot") pivotAt = step.at[0];
            if (step.type === "sorted") {
                step.at.forEach(function (i) { done.add(i); });
                pivotAt = null;
            }
            draw(step);
            msg.textContent = `${chosen.name}: ${describe(step)}`;
            // A swap can move the pivot itself, ending its job as a marker.
            if (step.type === "swap" && step.at.includes(pivotAt)) pivotAt = null;
            await sleep(delay());
            if (!runner.alive(token)) return; // Stop, Reset or leaving the page
        }

        setSorting(false);
        draw();
        msg.textContent = `Done. ${chosen.name} used ${comparisons} comparisons and ${moves} swaps or moves.`;
    }

    // Cancel a running sort. The bars keep their current order.
    function stop() {
        runner.cancel();
        // Closing the generator lets merge sort put its copies back.
        if (steps) steps.return();
        steps = null;
        setSorting(false);
        pivotAt = null;
        draw();
    }

    function shuffle() {
        const count = Number(countSlider.value);
        start = [];
        for (let i = 0; i < count; i++) {
            start.push(Math.floor(Math.random() * 95) + 5);
        }
        // Avoid handing out a set that is already sorted.
        if (start.every(function (v, i) { return i === 0 || start[i - 1] <= v; })) {
            start.reverse();
            if (start[0] === start[count - 1]) start[0] = 99;
        }
        values = start.slice();
        clearProgress();
        draw();
        msg.textContent = `New set of ${count} bars. Pick an algorithm and press Sort.`;
    }

    function reset() {
        stop();
        values = start.slice();
        clearProgress();
        draw();
        msg.textContent = "Back to the last shuffled order. Try another algorithm on the same bars.";
    }

    goButton.onclick = function () {
        if (!sorting) {
            sort();
            return;
        }
        stop();
        msg.textContent = "Stopped. Press Sort to sort these bars, or Reset for the shuffled order.";
    };
    algo.onchange = function () { draw(); };
    document.getElementById("sort-shuffle").onclick = shuffle;
    document.getElementById("sort-reset").onclick = reset;
    countSlider.oninput = function () {
        document.getElementById("sort-count-label").textContent = countSlider.value;
        shuffle();
    };
    speedSlider.oninput = function () {
        document.getElementById("sort-speed-label").textContent = speedSlider.value;
    };
    setupInfo("sort-info-btn", "sort-info");
    onLeavePage("sorting-page", function () {
        if (sorting) {
            stop();
            msg.textContent = "Sorting cancelled because you left the page.";
        }
    });

    // Browsers may remember slider positions after a reload, so show them.
    document.getElementById("sort-count-label").textContent = countSlider.value;
    document.getElementById("sort-speed-label").textContent = speedSlider.value;
    shuffle();
    msg.textContent = "Pick an algorithm and press Sort.";
})();
