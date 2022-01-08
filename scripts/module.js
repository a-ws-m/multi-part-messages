"use strict";

import { MODULE_NAME } from "./lib/config.js";
import { versionGt8, convertToMultiPart, formatItemName, addItemImage, addFlipButton } from "./lib/lib.js";

// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
const imageFileTypes = ["apng", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "webp", "bmp", "ico", "cur", "tif", "tiff"];
/**
 * @returns {{names: Array<String>, paths: Array<String>}}
 */
const emptyItemImages = () => {return {names: [], paths: []};};
let itemImages = emptyItemImages();
const debounceReload = debounce(() => window.location.reload(), 100);

Hooks.once("init", async function () {
    game.settings.register(MODULE_NAME, "itemImagesDirectory", {
        name: game.i18n.localize("MULTI-PART-MESSAGES.ItemImagesDirectoryTitle"),
        hint: game.i18n.localize("MULTI-PART-MESSAGES.ItemImagesDirectoryHint"),
        scope: "world",
        config: true,
        default: "",
        type: String,
        filePicker: true,
        onChange: (dir) => getItemImages(dir),
    });
    game.settings.register(MODULE_NAME, "itemImagesSource", {
        name: game.i18n.localize("MULTI-PART-MESSAGES.source.name"),
        scope: "world",
        config: true,
        type: String,
        choices: {
            data: game.i18n.localize("MULTI-PART-MESSAGES.source.data"),
            forgevtt: game.i18n.localize("MULTI-PART-MESSAGES.source.forgevtt"),
            s3: game.i18n.localize("MULTI-PART-MESSAGES.source.s3"),
        },
        default: "data",
        onChange: debounceReload,
    });
    game.settings.register(MODULE_NAME, "itemImagesFront", {
        name: game.i18n.localize("MULTI-PART-MESSAGES.ItemImagesFrontTitle"),
        hint: game.i18n.localize("MULTI-PART-MESSAGES.ItemImagesFrontHint"),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: debounceReload,
    });
});

Hooks.on("setup", async function () {
    const itemImagesDir = game.settings.get(MODULE_NAME, "itemImagesDirectory");
    getItemImages(itemImagesDir);
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
    const $content = $(content);

    const itemHeader = $content.find(".item-name")[0];
    if (itemHeader) {
        const itemName = formatItemName(itemHeader.innerText);
        const imageIndex = itemImages.names.indexOf(itemName);
        if (imageIndex !== -1) {
            addItemImage($content, itemImages.paths[imageIndex]);
        }
    }

    addFlipButton($content);

    // everytime a message is rendered in chat, if it's a flip message we add
    // the double click to cycle
    // for (let container of flipContainers) {
    //     container.addEventListener("dblclick", () => {
    //         $(container).toggleClass("flip-active");
    //         let parts = $(container).parent().find(".flip-container");
    //         parts
    //             .eq((parts.index($(container)) + 1) % parts.length)
    //             .toggleClass("flip-active");
    //     });
    // }
});


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

    const source = game.settings.get(MODULE_NAME, "itemImagesSource");
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
