"use strict";

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
    const flipRe = /\n\[flip\]\n/;
    if (!flipRe.test(message)) return;

    let parts = message.split(flipRe);

    let new_message = "";
    parts.forEach((value, index, _0) => {
        new_message += wrapPartInDiv(value, index);
    });

    return new_message;
}

/**
 * Cycles the 'active' component of a multi-part message.
 */
function changeActivePart() {
    let parts = $(this).parent().children();
    $this = $(this).toggleClass("flip-active");
    parts
        .eq((parts.index($this) + 1) % parts.length)
        .toggleClass("flip-active");
}

export { isFoundry8, convertToMultiPart, changeActivePart };
