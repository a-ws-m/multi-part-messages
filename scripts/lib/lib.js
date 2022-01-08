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
    const versionRe = /(\d+)\.(\d+)/;
    const versionParts = foundryVersion.match(versionRe);
    if (versionParts[1] === "0") {
        // Semantic versioning used before v9; this should be 0.8 or less
        return Number(versionParts[2]) >= 8;
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

/**
 * Add a flippable item image to a chat card.
 * 
 * @param {HTMLElement} content The original chat card content.
 * @param {string} itemPath The path to the image.
 * 
 */
function addItemImage(content, imagePath) {
    $(content).find(".card-content").children().wrapAll(`<div class="flip-container flip-active" />`);
    const imageDom = `<div class="flip-container"><img src="${imagePath}" width="100%" /></div>`;
    $(content).find(".card-content").append(imageDom);
}

/**
 * Simplify an item name
 * @description Remove whitespace and convert to lower case
 * 
 * @param {string} itemName The item name to format
 * 
 * @returns {string} The formatted name.
 */
function formatItemName(itemName) {
    return itemName.replace(/\s/g, "").toLowerCase();
}

export { versionGt8, convertToMultiPart, formatItemName, addItemImage };
