import { getTreeElement, setElementActive } from "../sidebar/treeController.js";
import { getBookmarks, getFolders } from "../state.js";

export function initMainContentInteraction() {
    const container = document.getElementById("main-content-container");
    const addBookmarkBtn = document.getElementById("add-bookmark-btn");

    container.addEventListener("click", (event) => {
        const target = event.target;

        // Check if click was on a button
        const targetButton = target.closest("button");
        if (!targetButton) return;

        // Find the id
        const itemWrapper = target.closest("[data-id]");
        const id = parseInt(itemWrapper.dataset.id, 10);

        // View details button clicked
        if (targetButton.classList.contains("view-details-btn")) {
            // Find the bookmark with this id in the tree and set it active
            const treeElement = getTreeElement(id, "b");
            if (!treeElement) return;
            setElementActive(treeElement, "b", id);
        }
        // Edit button clicked
        else if (targetButton.classList.contains("edit-btn")) {
            console.log(`Edit button clicked for bookmark: ${id}`);
        }
        // Delete button clicked
        else if (targetButton.classList.contains("delete-btn")) {
            console.log(`Delete button clicked for bookmark: ${id}`);
        }
        // Back to folder button clicked
        else if (targetButton.classList.contains("back-btn")) {
            const bookmarks = getBookmarks();
            const folders = getFolders();

            const targetBookmark = bookmarks.find((b) => {
                return b.id === id;
            });

            const parentFolder = folders.find((f) => {
                return f.id === targetBookmark.folder_id;
            });

            if (!parentFolder) return;

            // Find folder's tree element and set it active
            const treeElement = getTreeElement(parentFolder.id, "f");
            if (!treeElement) return;
            setElementActive(treeElement, "f", parentFolder.id);
        }
    });

    addBookmarkBtn.addEventListener("click", (event) => {
        console.log("Add bookmark button clicked");
    });
}
