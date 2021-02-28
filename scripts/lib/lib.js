"use strict";

/**
 * Returns the foundry version
 *
 * @return {number | string | undefined}
 */
function getFoundryVersion() {
    return game?.data?.version;
}

/**
 * Returns if the foundry version is 0.8.x
 *
 * @return {boolean}
 */
function isFoundry8() {
    const foundryVersion = getFoundryVersion();
    return foundryVersion >= "0.8.0" && foundryVersion < "0.9.0";
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

export { isFoundry8, convertToMultiPart };
