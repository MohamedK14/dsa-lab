// Small helpers shared by every page.

// Show or hide a page's (i) info panel when its button is clicked.
function setupInfo(buttonId, panelId) {
    const button = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    button.onclick = function () {
        panel.hidden = !panel.hidden;
        button.setAttribute("aria-expanded", String(!panel.hidden));
    };
}

// Read a whole number from an input box.
// Empty box: pick a random number from 1 to 99 (random is true).
// Anything that is not a whole number from -999 to 999: return null.
function readNumber(input) {
    const raw = input.value.trim();
    if (raw === "") {
        return { value: Math.floor(Math.random() * 99) + 1, random: true };
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < -999 || n > 999) {
        return null;
    }
    return { value: n, random: false };
}

// Wait for ms milliseconds. Step-by-step animations use this between steps.
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
