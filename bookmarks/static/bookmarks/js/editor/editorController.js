import { getTreeElement, setElementActive } from "../sidebar/treeController.js";

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

        const csrfToken = document.querySelector(
            "#csrf-container [name=csrfmiddlewaretoken]",
        ).value;

        // TODO: make the fetch()
    }

    function onCancel(event) {
        const treeElement = getTreeElement(parentId, "f");
        setElementActive(treeElement, "f", parentId);
    }
}
