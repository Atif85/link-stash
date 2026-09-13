import { addOrUpdateBookmark } from "../state.js";
import { getTreeElement, refreshTreeAndSelect, setElementActive } from "../sidebar/treeController.js";
import { request } from "../api.js";

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

        request(endpoint, method, payload).then((data) => {
            if (data.success) {
                // Update local state
                addOrUpdateBookmark(data.bookmark);
                refreshTreeAndSelect(data.bookmark.id, "b")
            } else {
                if (data.errors) {
                    const errors = data.errors;
                    if (errors.url) {
                        const urlInput = document.getElementById("url");
                        const urlError = document.getElementById("url-error");
                        urlInput.classList.add("is-invalid");
                        urlError.textContent = errors.url;
                    }
                    console.error(errors);
                } else if (data.error) {
                    console.error(data.error);
                }
            }
        });
    }

    function onCancel() {
        const treeElement = getTreeElement(parentId, "f");
        setElementActive(treeElement, "f", parentId);
    }
}
