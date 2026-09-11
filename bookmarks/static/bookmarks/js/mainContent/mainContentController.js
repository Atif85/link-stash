import { renderBookmarkForm } from "../editor/editorRenderer.js";
import { getTreeElement, setElementActive } from "../sidebar/treeController.js";
import { rebuildTree } from "../sidebar/treeRenderer.js";
import {
    getBookmarks,
    getFolders,
    getActiveItem,
    removeBookmark,
} from "../state.js";

export function initMainContentInteraction() {
    const container = document.getElementById("main-content-container");
    const addBookmarkBtn = document.getElementById("add-bookmark-btn");

    // Initialize the Bootstrap Modal
    const deleteModalEl = document.getElementById("del-confirm-modal");
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

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
            confirmDeleteBtn.dataset.bookmarkId = id;
            confirmDeleteBtn.dataset.parentFolderId = parentFolder.id;

            // Show the modal
            deleteModal.show();
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
        const bookmarks = getBookmarks();
        const folders = getFolders();
        const activeItem = getActiveItem();

        if (!activeItem) {
            const rootFolder = folders.find((f) => {
                return f.parent_id === null && f.name === "Root";
            });

            if (!rootFolder) return;

            renderBookmarkForm(null, rootFolder);
            return;
        }

        const { type, id } = activeItem;

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

    confirmDeleteBtn.addEventListener("click", () => {
        const bookmarkId = parseInt(confirmDeleteBtn.dataset.bookmarkId, 10);
        const parentFolderId = parseInt(confirmDeleteBtn.dataset.parentFolderId, 10);

        // Close the modal popup
        deleteModal.hide();

        // Get csrf token from the html element
        const csrfToken = document.querySelector(
            "#csrf-container [name=csrfmiddlewaretoken]",
        ).value;

        // Make the DELETE fetch
        fetch(`/api/bookmarks/delete/${bookmarkId}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": csrfToken },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    // Update local state
                    removeBookmark(bookmarkId);

                    // Rebuild tree
                    rebuildTree(); // TODO: only update whats needed

                    // Set the parent folder active
                    const newTreeItem = getTreeElement(parentFolderId, "f");
                    setElementActive(newTreeItem, "f", parentFolderId);
                } else {
                    if (data.errors) {
                        console.log(data.errors);
                    } else if (data.error) {
                        console.log(data.error);
                    }
                }
            });
    });
}
