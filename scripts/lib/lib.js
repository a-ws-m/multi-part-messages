"use strict";

import { MODULE_NAME } from "./config.js";

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
 * Get a flip container div element.
 * 
 * @param {boolean} active Whether the flip container should be active (visible)
 * @param {boolean} asJQuery Whether to return the container as a JQuery element.
 *  If `false` (default), returns a string.
 * 
 * @returns {jQuery object | string} The div element.
 */
function getFlipContainer(active, asJQuery) {
    const flipContainer = $("<div />").addClass("flip-container");
    if (active) flipContainer.addClass("flip-active");
    return asJQuery ? flipContainer : flipContainer[0].outerHTML;
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
    const flipContainer = getFlipContainer(number === 0);
    // Trim the terminating </div>
    return flipContainer.slice(0, -6) + part + "</div>";
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
    const cardContent = $(content).find(".card-content");
    const itemImageFirst = game.settings.get(MODULE_NAME, "itemImagesFront");
    cardContent.children().wrapAll(getFlipContainer(!itemImageFirst, true));
    const imageDom = $(`<img src="${imagePath}" width="100%" />`);
    cardContent.append(imageDom.wrap(getFlipContainer(itemImageFirst), true).parent());
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

export { versionGt8, convertToMultiPart, formatItemName, addItemImage  };
