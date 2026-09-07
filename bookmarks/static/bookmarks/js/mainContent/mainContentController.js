import { renderBookmarkForm } from "../editor/editorRenderer.js";
import { getTreeElement, setElementActive } from "../sidebar/treeController.js";
import { getBookmarks, getFolders, getActiveItem } from "../state.js";

export function initMainContentInteraction() {
    const container = document.getElementById("main-content-container");
    const addBookmarkBtn = document.getElementById("add-bookmark-btn");

    container.addEventListener("click", (event) => {
        const target = event.target;

        // Check if click was on a button
        const targetButton = target.closest("button");
        if (!targetButton) return;

        const bookmarks = getBookmarks();
        const folders = getFolders();

        // Find the id
        const itemWrapper = target.closest("[data-id]");
        const id = parseInt(itemWrapper.dataset.id, 10);

        const targetBookmark = bookmarks.find((b) => {
            return b.id === id;
        });
        if (!targetBookmark) return;
        const parentFolder = folders.find((f) => {
            return f.id === targetBookmark.folder_id;
        });
        if (!parentFolder) return;

        // View details button clicked
        if (targetButton.classList.contains("view-details-btn")) {
            // Find the bookmark with this id in the tree and set it active
            const treeElement = getTreeElement(id, "b");
            if (!treeElement) return;
            setElementActive(treeElement, "b", id);
        }
        // Edit button clicked
        else if (targetButton.classList.contains("edit-btn")) {
            renderBookmarkForm(targetBookmark, parentFolder);
        }
        // Delete button clicked
        else if (targetButton.classList.contains("delete-btn")) {
            console.log(`Delete button clicked for bookmark: ${id}`);
        }
        // Back to folder button clicked
        else if (targetButton.classList.contains("back-btn")) {
            // Find folder's tree element and set it active
            const treeElement = getTreeElement(parentFolder.id, "f");
            if (!treeElement) return;
            setElementActive(treeElement, "f", parentFolder.id);
        }
    });

    addBookmarkBtn.addEventListener("click", () => {
        const activeItem = getActiveItem();
        const { type, id } = activeItem;

        const bookmarks = getBookmarks();
        const folders = getFolders();

        // If a Folder is selected
        if (type === "f") {
            const activeFolder = folders.find((f) => {
                return f.id === id;
            });

            if (!activeFolder) return;
            renderBookmarkForm(null, activeFolder);
        }
        // If a Bookmark is selected
        else if (type === "b") {
            const activeBookmark = bookmarks.find((b) => {
                return b.id === id;
            });
            if (!activeBookmark) return;
            const parentFolder = folders.find((f) => {
                return f.id === activeBookmark.folder_id;
            });
            if (!parentFolder) return;

            renderBookmarkForm(null, parentFolder);
        }
    });
}
