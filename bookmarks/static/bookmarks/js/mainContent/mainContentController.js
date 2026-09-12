import { renderBookmarkForm } from "../editor/editorRenderer.js";
import { getTreeElement, setElementActive } from "../sidebar/treeController.js";
import { rebuildTree } from "../sidebar/treeRenderer.js";
import {
    getBookmarks,
    getFolders,
    removeBookmark,
    getActiveItemFolder,
    removeFolder,
} from "../state.js";

export function initMainContentInteraction() {
    const container = document.getElementById("main-content-container");
    const addBookmarkBtn = document.getElementById("add-bookmark-btn");

    // Initialize the Bootstrap Modals
    const deleteModalEl = document.getElementById("del-confirm-modal");
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    const deleteModalLabel = document.getElementById("del-modal-label");
    const deleteModalBody = deleteModalEl.querySelector(".modal-body");

    const renameModalEl = document.getElementById("rename-folder-modal");
    const renameModal = new bootstrap.Modal(renameModalEl);
    const confirmRenameBtn = document.getElementById("confirm-rename-btn");

    container.addEventListener("click", (event) => {
        const target = event.target;

        // Check if click was on a button
        const targetButton = target.closest("button");
        if (!targetButton) return;

        const bookmarks = getBookmarks();
        const folders = getFolders();

        // Find the id
        const itemWrapper = target.closest("[data-id]");
        if (!itemWrapper) return;

        const id = parseInt(itemWrapper.dataset.id, 10);
        const itemType = itemWrapper.dataset.type || "b";

        // If folder button clicked
        if (itemType === "f") {
            const targetFolder = folders.find((f) => {
                return f.id === id;
            });
            if (!targetFolder) return;

            const parentFolder = folders.find((f) => {
                return f.id === targetFolder.parent_id;
            });
            if (!parentFolder) return;

            if (targetButton.classList.contains("delete-folder-btn")) {
                confirmDeleteBtn.dataset.itemType = "f";
                confirmDeleteBtn.dataset.id = id;
                confirmDeleteBtn.dataset.parentFolderId = parentFolder.id;

                deleteModalLabel.textContent = "Delete Folder?";

                deleteModalBody.textContent =
                    "Are you sure you want to delete this folder?";

                // Show the modal
                deleteModal.show();
            } else if (targetButton.classList.contains("rename-folder-btn")) {
                const input = document.getElementById("rename-folder-input");
                input.value = targetFolder.name;
                renameModal.show();
            }
            return;
        }

        // If bookmark button clicked
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
        // Delete bookmark button clicked
        else if (targetButton.classList.contains("delete-bookmark-btn")) {
            confirmDeleteBtn.dataset.itemType = "b";
            confirmDeleteBtn.dataset.id = id;
            confirmDeleteBtn.dataset.parentFolderId = parentFolder.id;

            deleteModalLabel.textContent = "Delete Bookmark?";
            deleteModalBody.textContent =
                "Are you sure you want to delete this bookmark?";

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
        const activeItemParent = getActiveItemFolder();
        renderBookmarkForm(null, activeItemParent);
    });

    confirmDeleteBtn.addEventListener("click", () => {
        const itemType = confirmDeleteBtn.dataset.itemType;

        const id = parseInt(confirmDeleteBtn.dataset.id, 10);
        const parentFolderId = parseInt(
            confirmDeleteBtn.dataset.parentFolderId,
            10,
        );

        // Get csrf token from the html element
        const csrfToken = document.querySelector(
            "#csrf-container [name=csrfmiddlewaretoken]",
        ).value;

        deleteModal.hide();
        const endpoint =
            itemType === "f"
                ? `/api/folders/delete/${id}/`
                : `/api/bookmarks/delete/${id}/`;

        const method = "DELETE";

        // Make the DELETE fetch
        fetch(endpoint, {
            method: method,
            headers: { "X-CSRFToken": csrfToken },
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    // Update local state
                    if (itemType === "f") {
                        removeFolder(id);
                    } else {
                        removeBookmark(id);
                    }

                    // Rebuild tree
                    rebuildTree(); // TODO: only update whats needed

                    // Set the parent folder active
                    const newTreeItem = getTreeElement(
                        parentFolderId,
                        itemType,
                    );
                    setElementActive(newTreeItem, itemType, parentFolderId);
                } else {
                    if (data.errors) {
                        console.error(data.errors);
                    } else if (data.error) {
                        console.error(data.error);
                    }
                }
            });
    });
}
