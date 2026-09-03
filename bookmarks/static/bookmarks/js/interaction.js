import { setActiveItem } from "./state.js";

let clickTimer = null;
const DELAY = 250; // Milliseconds

export function initInteraction() {
    const sidebarContent = document.getElementById("sidebar-content");

    sidebarContent.addEventListener("click", onSingleClick);
    sidebarContent.addEventListener("dblclick", onDoubleClick);
}

function onSingleClick(event) {
    const targetElement = event.target;
    if (!targetElement) return;

    // Find the closest list item. (bookmark/folder)
    const targetli = targetElement.closest("li");
    const targetTreeItem = targetli.querySelector(".tree-item");

    const targetType = targetli.dataset.type; // f/b
    const targetID = targetli.dataset.id;

    const isSingleClick = true;
    // If timer is null this is a single click
    if (clickTimer === null) {
        // Start timer after the first click
        clickTimer = setTimeout(() => {
            clickTimer = null;
        }, DELAY);
    }
    // If timer already exists its a double click
    else {
        clearTimeout(clickTimer);
        clickTimer = null;
        isSingleClick = false;
    }

    if (targetType === "f") {
        if (isSingleClick) {
            // Click on the caret.
            if (targetElement.classList.contains("tree-caret-icon")) {
                // Toggle state of the folder
                targetli.classList.toggle("folder-expanded");
                targetli.classList.toggle("folder-collapsed");

                return;
            }

            setElementActive(targetTreeItem, targetType, targetID);
        } else {
            // Double Click
            targetli.classList.toggle("folder-expanded");
            targetli.classList.toggle("folder-collapsed");
        }
    } else if (targetType === "b") {
        if (isSingleClick) {
            setElementActive(targetTreeItem, targetType, targetID);
        }
    }
}

function onDoubleClick(event) {
    const targetElement = event.target;
    if (!targetElement) return;

    // Find the closest list item. (bookmark/folder)
    const targetli = targetElement.closest("li");
    const targetTreeItem = targetli.querySelector(".tree-item");

    const targetType = targetli.dataset.type; // f/b
    const targetID = targetli.dataset.id;

    if (targetType === "f") {
        targetli.classList.toggle("folder-expanded");
        targetli.classList.toggle("folder-collapsed");
    } else if (targetType === "b") {
    }
}

function setElementActive(element, type, id) {
    const currentActive = document.querySelector(".tree-item.active");

    if (currentActive !== null) {
        currentActive.classList.remove("active");
    }

    element.classList.add("active");

    setActiveItem(type, id);
}
