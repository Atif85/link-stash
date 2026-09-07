import { getFolderPath } from "../mainContent/mainContentRenderer.js";

export function renderBookmarkForm(bookmark = null, parentFolder) {
    const container = document.getElementById("main-content-container");
    container.innerHTML = "";

    if (!parentFolder) return;

    const isEdit = bookmark !== null;

    const formHeading = isEdit ? "Edit Bookmark" : "Create New Bookmark";
    const bookmarkLocationPath = getFolderPath(parentFolder);

    const rootDiv = document.createElement("div");
    rootDiv.className = "mx-auto py-4";
    rootDiv.style.maxWidth = "800px";

    rootDiv.innerHTML = `
    <h1 id="form-heading" class="fw-bold mb-4 mt-3">${formHeading}</h1>
                    
    <hr class="my-4">

    <form id="bookmark-form" data-form-type="${isEdit ? "edit" : "create"}" data-id="${isEdit ? bookmark.id : ""}" data-parent-id="${parentFolder.id}">             
        <div class="mb-4">
            <!-- Title -->
            <div class="row align-items-center mb-3">
                <div class="col-2">
                    <label for="title" class="text-muted fw-bold text-uppercase">Title</label>
                </div>
                <div class="col-10">
                    <input type="text" id="title" class="form-control" placeholder="Enter bookmark title..."
                           value="${isEdit ? bookmark.title : ""}">
                    <div id="title-error" class="invalid-feedback">Please enter a valid title.</div>
                </div>
            </div>

            <!-- URL -->
            <div class="row align-items-center mb-3">
                <div class="col-2">
                    <label for="url" class="text-muted fw-bold text-uppercase">URL</label>
                </div>  
                <div class="col-10">
                    <input type="text" id="url" class="form-control" placeholder="https://example.com" autofocus
                           value="${isEdit ? bookmark.url : ""}">
                    <div id="url-error" class="invalid-feedback">Please enter a valid url.</div>
                </div>
            </div>

            <!-- Location -->
            <div class="row align-items-center mb-3">
                <div class="col-2">
                    <span class="text-muted fw-bold text-uppercase">Location</span>
                </div>
                <div class="col-10">
                    <span id="bookmark-location" class="badge bg-secondary px-2.5 py-1.5 fs-6">
                        ${bookmarkLocationPath}
                    </span>
                </div>
            </div>
        </div>

        <hr class="my-4">

        <div class="d-flex gap-3">
            <button type="submit" id="submit-form-btn" class="btn btn-primary d-flex align-items-center">
                <i class="bi bi-check-lg me-2"></i> Save Bookmark
            </button>
            <button type="button" id="cancel-form-btn" class="btn btn-secondary d-flex align-items-center">
                Cancel
            </button>
        </div>
    </form>
    `;

    container.append(rootDiv);
}
