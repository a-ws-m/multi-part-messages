"use strict";

import { versionGt8, convertToMultiPart, formatItemName, addItemImage } from "./lib/lib.js";

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const imageFileTypes = ["apng", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp", "bmp", "ico", "cur", "tif", "tiff"];
/**
 * @returns {{names: Array<String>, paths: Array<String>}}
 */
const emptyItemImages = () => {return {names: [], paths: []};};
let itemImages = emptyItemImages();

Hooks.once("init", async function () {
    game.settings.register("multi-part-messages", "itemImagesDirectory", {
        name: "Item Images Directory",
        hint: "Where to look for item card flippable images. Leave empty to disable this behaviour.",
        scope: "world",
        config: true,
        default: "",
        type: String,
        filePicker: true,
        onChange: (dir) => getItemImages(dir),
    });
    game.settings.register("multi-part-messages", "itemImagesSource", {
        name: "Item Images Directory Source",
        scope: "world",
        config: true,
        type: String,
        choices: {
            data: "Foundry Data",
            forgevtt: "Forge Assets Library",
            s3: "AWS S3 Bucket",
        },
        default: "data",
        onChange: (src) => updateItemImages(),
    });
});

Hooks.on("setup", async function () {
    updateItemImages();
});

Hooks.on("preCreateChatMessage", (message, options) => {
    const messageSource = versionGt8() ? message.data._source : message;

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

    const itemHeader = content.querySelector(".item-name");
    if (itemHeader) {
        const itemName = formatItemName(itemHeader.innerText);
        const imageIndex = itemImages.names.indexOf(itemName);
        if (imageIndex !== -1) {
            addItemImage(content, itemImages.paths[imageIndex]);
        }
    }

    let flipContainers = content.querySelectorAll(".flip-container");

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


/**
 * Wrapper for `getItemImages()` that determines the item images directory from game settings.
 * 
 */
async function updateItemImages() {
    const itemImagesDir = game.settings.get("multi-part-messages", "itemImagesDirectory");
    getItemImages(itemImagesDir);
}

/**
 * Get the list of formatted image names and paths in the item images directory.
 * 
 * @param {string} directory - where to search for item card images.
 * 
 * @returns {{names: Array<String>, paths: Array<String>}}
 */
async function getItemImages(directory) {
    if (directory === "") {
        itemImages = emptyItemImages();
        return itemImages;
    }

    const source = game.settings.get("multi-part-messages", "itemImagesSource");
    let browseOptions = {extensions: imageFileTypes.map((str) => "." + str)};
    if (source === "s3") {
        const bucketContainer = await FilePicker.browse(source, directory);
        const bucket = bucketContainer.dirs[0];
        browseOptions.bucket = bucket;
    }

    const itemCardDirArray = await FilePicker.browse(source, directory, browseOptions);
    if (itemCardDirArray.target !== directory) {
        throw "FilePicker target did not match `itemImagesDirectory`."
    }

    let itemNamesBuffer = [];
    let itemImagePathsBuffer = [];
    const fileRegex = /(?:^|\/)([^\/]+)\.(?:.+)$/;
    for (let file of itemCardDirArray.files) {
        const match = fileRegex.exec(file);
        if (match) {
            itemNamesBuffer.push(formatItemName(match[1]));
            itemImagePathsBuffer.push(file);
        }
    }

    itemImages = {names: itemNamesBuffer, paths: itemImagePathsBuffer};
    return itemImages;
}
