"use strict";

import { isFoundry8, convertToMultiPart } from "./lib/lib.js";

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
    const content = html?.[0] ?? null;
    if (!content) return;

    let flipContainers = content.querySelectorAll(".flip-container");
    if (!flipContainers) return;

    // everytime a message is rendered in chat, if it's a flip message we add
    // the double click to cycle
    for (let container of flipContainers) {
        container.addEventListener("dblclick", () => {
            $(container).toggleClass("flip-active");
            let parts = $(container).parent().find(".flip-container");
            parts
                .eq((parts.index($(container)) + 1) % parts.length)
                .toggleClass("flip-active");
        });
    }
});
