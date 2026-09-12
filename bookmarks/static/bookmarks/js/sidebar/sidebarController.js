import { getActiveItemFolder } from "../state.js";
import {
    expandAllParentFolders,
    getTreeElement,
    getTreeFolderList,
} from "./treeController.js";

export function initSidebarInteraction() {
    // Get the resizer and sidebar elements
    const sidebar = document.getElementById("sidebar");
    const resizer = document.getElementById("sidebar-resizer");
    const STORAGE_KEY = "sidebar-width";

    if (!sidebar || !resizer) return;

    // Try to set width from LocalStorage
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth !== null) {
        const parsedWidth = Number(savedWidth);
        if (!Number.isNaN(parsedWidth)) {
            setClampedWidth(parsedWidth);
        }
    }

    // Add the event listener for Drag Start
    resizer.addEventListener("mousedown", onMouseDown);

    // Add event listener for add folder button
    const addFolderBtn = document.getElementById("add-folder-btn");
    addFolderBtn.addEventListener("click", onAddFolderClicked);

    function onAddFolderClicked(event) {
        const activeItemFolder = getActiveItemFolder();
        if (!activeItemFolder) return;

        if (
            activeItemFolder.name !== "Root" &&
            activeItemFolder.parent_id !== null
        ) {
            // Expand itself and parent folders if its not the root folder
            const folderTreeItemEl = getTreeElement(activeItemFolder.id, "f");
            expandAllParentFolders(folderTreeItemEl, "f", true);
        }

        const folderList = getTreeFolderList(activeItemFolder.id);

        const inputListItem = document.createElement("li");

        inputListItem.innerHTML = `
            <div class="tree-folder-input">
                <i class="bi bi-folder-fill tree-folder-icon"></i>
                <input type="text" class="form-control form-control-sm py-0 bg-body text-body" 
                    placeholder="New folder"
                    required>
            </div>
        `;

        const input = inputListItem.querySelector("input");
        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
            } else if (event.key === "Enter") {
                event.preventDefault();
                // Check if input is valid
                if (!input.checkValidity()) {
                    input.reportValidity();
                } else {
                    onSubmit();
                }
            }
        });

        input.addEventListener("blur", () => {
            if (!input.checkValidity()) {
                onCancel();
            } else {
                onSubmit();
            }
        });

        folderList.append(inputListItem);
        input.focus();

        function onCancel() {
            inputListItem.remove();
        }

        function onSubmit() {
            // TODO: make the fetch
            inputListItem.remove();
        }
    }

    function onMouseDown(event) {
        event.preventDefault();

        // When dragging globally set the cursor to col-resize and prevent selecting.
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
    }

    function onMouseMove(event) {
        setClampedWidth(event.clientX);
    }

    function onMouseUp() {
        // Reset cursor and userselect
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        // Remove event listeners
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);

        const currentWidth = Number.parseFloat(sidebar.style.width);
        if (!Number.isNaN(currentWidth)) {
            localStorage.setItem(STORAGE_KEY, String(Math.round(currentWidth)));
        }
    }

    function setClampedWidth(width) {
        const minWidth = 200;
        const maxWidth = 550;

        const newWidth = Math.min(Math.max(Number(width), minWidth), maxWidth);

        sidebar.style.width = `${newWidth}px`;
        return newWidth;
    }
}
