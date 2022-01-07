"use strict";

/**
 * Returns the foundry version
 *
 * @return {string}
 */
function getFoundryVersion() {
    return game?.data?.version || game.version;
}

/**
 * Returns if the foundry version is >= 0.8.0
 *
 * @return {boolean}
 */
function versionGt8() {
    const foundryVersion = getFoundryVersion();
    const versionRe = /(\d+)\.(\d+)/g;
    const versionParts = foundryVersion.exec(versionRe);
    if (versionParts[0] === "0") {
        // Semantic versioning used before v9; this should be 0.8 or less
        return Number(versionParts[1]) >= 8;
    }
    // Not semantic versioning -- v9 or later
    return true;
}

/**
 * Wraps part of a message in an appropriate divider
 *
 * @param {string} part The string component of the part of the message
 * @param {int} number The index of the part of the message
 *
 * @return {string}
 */
function wrapPartInDiv(part, number) {
    return `<div class="flip-container${
        number == 0 ? " flip-active" : ""
    }">${part}</div>`;
}

/**
 * If the message has the divider markup, returns an HTML template with separate `div` tags
 *
 * @param {string} message - the content of a chat message
 *
 * @return {string|null}
 */
function convertToMultiPart(message) {
    const flipRe = /(?:<p>)?\s*\[flip\]\s*(?:<\/p>)?/;
    if (!flipRe.test(message)) return;

    let parts = message.split(flipRe);
    if (parts.length < 4) return;

    for (let counter = 0; counter < parts.length - 2; counter++) {
        let index = counter + 1;
        parts[index] = wrapPartInDiv(parts[index], counter);
    }

    return parts.join("");
}

export { versionGt8, convertToMultiPart };
