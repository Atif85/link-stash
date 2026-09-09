import { addOrUpdateBookmark } from "../state.js";
import { getTreeElement, setElementActive } from "../sidebar/treeController.js";
import { rebuildTree } from "../sidebar/treeRenderer.js";

export function initFormInteraction() {
    const form = document.getElementById("bookmark-form");
    if (!form) return;

    const cancelBtn = document.getElementById("cancel-form-btn");

    const formType = form.dataset.formType;
    const parentId = parseInt(form.dataset.parentId, 10);
    const bookmarkId = form.dataset.id ? parseInt(form.dataset.id, 10) : null;

    if (!parentId || !formType) return;

    form.onsubmit = onSubmit;
    cancelBtn.onclick = onCancel;

    function onSubmit(event) {
        event.preventDefault();

        const titleInput = form.querySelector("#title");
        const urlInput = form.querySelector("#url");

        // Clear previous errors
        titleInput.classList.remove("is-invalid");
        urlInput.classList.remove("is-invalid");

        let titleValue = titleInput.value.trim();
        let urlValue = urlInput.value.trim();

        if (urlValue === "") {
            urlInput.classList.add("is-invalid");
            return;
        }

        // If title is left blank make the url the title
        if (titleValue === "") {
            titleValue = urlValue;
        }

        // Get csrf token from the html element
        const csrfToken = document.querySelector(
            "#csrf-container [name=csrfmiddlewaretoken]",
        ).value;

        let endpoint = "/api/bookmarks/create/";
        let method = "POST";
        let payload = {
            title: titleValue,
            url: urlValue,
            folder_id: parentId,
        };

        if (formType === "edit") {
            endpoint = `/api/bookmarks/edit/${bookmarkId}/`;
            method = "PATCH";
            payload["new_folder_id"] = parentId;
        }

        fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    // Update local state
                    addOrUpdateBookmark(data.bookmark);

                    // Rebuild tree
                    rebuildTree(); // TODO: only update whats needed

                    // Set the bookmark active
                    const newTreeItem = getTreeElement(data.bookmark.id, "b");
                    setElementActive(newTreeItem, "b", data.bookmark.id);
                } else {
                    if (data.errors) {
                        const errors = data.errors;
                        if (errors.url) {
                            const urlInput = document.getElementById("url");
                            const urlError =
                                document.getElementById("url-error");
                            urlInput.classList.add("is-invalid");
                            urlError.textContent = errors.url;
                        }
                        console.log(errors);
                    } else if (data.error) {
                        console.log(data.error);
                    }
                }
            });
    }

    function onCancel(event) {
        const treeElement = getTreeElement(parentId, "f");
        setElementActive(treeElement, "f", parentId);
    }
}
