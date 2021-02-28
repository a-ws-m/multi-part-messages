"use strict";

import { isFoundry8, convertToMultiPart, changeActivePart } from "lib/lib.js";

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {});

Hooks.on("preCreateChatMessage", (message, options) => {
    const messageSource = isFoundry8() ? message.data._source : message;

    // if a message has flip syntax, wrap the correct bits in containers
    const content = convertToMultiPart(messageSource.content);
    if (!content) return;

    messageSource.content = content;
    // this is used to prevent the message from showing as a bubble
    // because it will not be rendered correctly
    options.chatBubble = false;
});

Hooks.on("renderChatMessage", (_0, html) => {
    const flipContainer = html?.[0]?.querySelector("flip-active");
    if (!flipContainer) return;

    // everytime a message is rendered in chat, if it's a flip message we add
    // the double click to cycle
    $(flipContainer).dblclick(changeActivePart);
});
