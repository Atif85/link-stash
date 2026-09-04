import { setActiveItem } from "./state.js";

export function initInteraction() {
    const sidebarContent = document.getElementById("sidebar-content");
    const rootList = document.getElementById("root-list");

    // Handle clicks events
    let clickTimer = null;
    const DELAY = 250;

    sidebarContent.addEventListener("click", onClick);

    // Handle pointer events
    const THRESHOLD = 6; // The amout that's needed to move the pointer before triggring drag

    let dragElement = null; // The element we will drag
    let placeholder = null; // Placeholder left inplace of the element being dragged
    let list = null;

    let elementRect = null;

    let isPendingDrag = false;
    let isDragging = false;

    let dragStartX = 0;
    let dragStartY = 0;

    sidebarContent.addEventListener("pointerdown", onPointerDown);

    // Pointer functions
    function onPointerDown(event) {
        if (event.button !== 0) return;

        const targetElement = event.target;
        const targetli = targetElement.closest("li");
        if (!targetli) return;

        list = targetli.closest("ul");

        dragElement = targetli;

        dragStartX = event.clientX;
        dragStartY = event.clientY;

        // Mark as potential drag event starting
        isPendingDrag = true;

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
    }

    function onPointerMove(event) {
        if (!isPendingDrag && !isDragging) return;

        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;

        if (isPendingDrag) {
            const distance = Math.hypot(deltaX, deltaY);

            if (distance < THRESHOLD) return;

            // Dragging started

            isPendingDrag = false;
            isDragging = true;

            // If dragging a folder collapse it first
            if (dragElement.classList.contains("folder-expanded")) {
                dragElement.classList.remove("folder-expanded");
                dragElement.classList.add("folder-collapsed");
            }

            elementRect = dragElement.getBoundingClientRect();

            // Create Placeholder
            placeholder = document.createElement("li");
            placeholder.className = "drop-placeholder";
            placeholder.style.height = elementRect.height + "px";
            list.insertBefore(placeholder, dragElement);

            // Lift the real element out of flow, pin it at its current screen position
            dragElement.classList.add("dragging");
            dragElement.style.width = elementRect.width + "px";
            dragElement.style.left = elementRect.left + "px";
            dragElement.style.top = elementRect.top + "px";
            document.body.appendChild(dragElement);
        }

        if (isDragging) {
            const offsetX = dragStartX - elementRect.left;
            const offsetY = dragStartY - elementRect.top;

            dragElement.style.left = event.clientX - offsetX + "px";
            dragElement.style.top = event.clientY - offsetY + "px";

            // TODO: check whats acutaly under it.
        }
    }

    function onPointerUp(event) {
        if (isPendingDrag) {
            isPendingDrag = false;
        }

        if (isDragging) {
            isDragging = false;
            dragElement.classList.remove("dragging");
            dragElement.style.position = "";
            dragElement.style.left = "";
            dragElement.style.top = "";
            dragElement.style.width = "";

            list.insertBefore(dragElement, placeholder);

            placeholder.remove();
            placeholder = null;
        }

        dragElement = null;
        list = null;

        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
    }

    function onClick(event) {
        const targetElement = event.target;
        if (!targetElement) return;

        // Find the closest list item. (bookmark/folder)
        const targetli = targetElement.closest("li");
        if (!targetli) {
            setElementActive(null);
            return;
        }

        const targetTreeItem = targetli.querySelector(".tree-item");

        const targetType = targetli.dataset.type; // f/b
        const targetID = targetli.dataset.id;

        let isSingleClick = true;
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

    // Set element active and update the state
    function setElementActive(element, type = null, id = null) {
        const currentActive = document.querySelector(".tree-item.active");

        if (currentActive !== null) {
            currentActive.classList.remove("active");
        }

        if (element === null) {
            setActiveItem(null, null);
        } else {
            element.classList.add("active");

            setActiveItem(type, id);
        }
    }
}
