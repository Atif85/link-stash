import { getActiveItem, getBookmarks, getFolders } from "./state.js";

export function updateMainContent() {
    const container = document.getElementById("main-content-container");
    const activeItem = getActiveItem();

    container.innerHTML = "";

    if (!activeItem) {
        renderDefaultView(container);
        return;
    }

    const { type, id } = activeItem;

    const bookmarks = getBookmarks();
    const folders = getFolders();

    // If a Folder is selected
    if (type === "f") {
        renderFolderView();
    }
    // If a Bookmark is selected
    else if (type === "b") {
        renderBookmarkView();
    }

    function renderFolderView() {
        const activeFolder = folders.find((f) => {
            return f.id === id;
        });

        const folderBookmarks = bookmarks.filter((b) => {
            return b.folder_id === id;
        });

        // Create folder header
        const headerDiv = document.createElement("div");
        headerDiv.className = "d-flex align-items-center mb-2";

        headerDiv.innerHTML = `
            <i class="bi bi-folder-fill text-primary fs-3 me-2"></i>
            <h2 class="fs-4 fw-bold m-0">${activeFolder.name}</h2>
        `;

        container.append(headerDiv);

        // Create bookmark list
        const list = createBookmarkList(folderBookmarks);
        container.append(list);
    }

    function renderBookmarkView() {
        const activeBookmark = bookmarks.find((b) => {
            return b.id === id;
        });
        const bookmarkFolder = folders.find((f) => {
            return f.id === activeBookmark.folder_id;
        });

        let locationPath = "";
        let currentFolder = bookmarkFolder;

        while (currentFolder.parent_id !== null) {
            locationPath =
                currentFolder.name +
                (locationPath === "" ? "" : `/${locationPath}`);
            currentFolder = folders.find((f) => {
                return f.id === currentFolder.parent_id;
            });
        }

        const rootDiv = document.createElement("div");
        rootDiv.className = "mx-auto py-4";
        rootDiv.style.maxWidth = "800px";

        rootDiv.innerHTML = `
            <div class="mb-4">
                <button class="btn btn-link btn-sm p-0 text-decoration-none text-muted">
                    <i class="bi bi-arrow-left me-1"></i> Back to Folder
                </button>
            </div>

            <h1 class="fw-bold mb-4">${activeBookmark.title}</h1>
            
            <hr class="my-4">

            <div class="mb-4">
                <div class="row align-items-center mb-3">
                    <div class="col-2">
                        <span class="text-muted fw-bold text-uppercase">URL</span>
                    </div>
                    <div class="col-10">
                        <a href="${activeBookmark.url}" target="_blank" class="text-break text-decoration-none fs-5">
                            ${activeBookmark.url} <i class="bi bi-box-arrow-up-right small ms-1"></i>
                        </a>
                    </div>
                </div>

                <div class="row align-items-center mb-3">
                    <div class="col-2">
                        <span class="text-muted fw-bold text-uppercase">Location</span>
                    </div>
                    <div class="col-10">
                        <span class="badge bg-secondary px-2.5 py-1.5 fs-6">
                            ${locationPath}
                        </span>
                    </div>
                </div>
            </div>

            <hr class="my-4">

            <div class="d-flex gap-3">
                <button class="btn btn-primary d-flex align-items-center">
                    <i class="bi bi-pencil-square me-2"></i> Edit Bookmark
                </button>
                <button class="btn btn-outline-danger d-flex align-items-center">
                    <i class="bi bi-trash me-2"></i> Delete
                </button>
            </div>
        `;

        container.append(rootDiv);
    }

    function renderDefaultView() {
        const div = document.createElement("div");
        div.className = "p-5";
        div.innerHTML = `
            <p class="text-center text-muted">Select a bookmark or folder.</p>
        `;

        container.append(div);
    }

    function createBookmarkList(bookmarks, isSearch = false) {
        // Create bookmark list
        const list = document.createElement("div");
        list.className = "list-group list-group-flush border-top border-bottom";

        // Populate bookmark list
        bookmarks.forEach((bookmark) => {
            const bookmarkLi = document.createElement("li");
            bookmarkLi.className =
                "list-group-item d-flex align-items-center p-0";

            const anchor = document.createElement("a");
            anchor.href = bookmark.url;
            anchor.target = "_blank";
            anchor.className =
                "d-flex align-items-center flex-grow-1 text-decoration-none text-body py-3 px-3 list-group-item-action";

            anchor.innerHTML = `
                <i class="bi bi-link-45deg fs-5 text-muted me-3"></i>
                <div class="flex-grow-1">
                    <div class="fw-semibold">${bookmark.title}</div>
                    <div class="text-muted small text-truncate" style="max-width: 400px;">${bookmark.url}.</div>
                </div>
            `;

            bookmarkLi.append(anchor);

            const btnContainer = document.createElement("div");
            btnContainer.className = "btn-group d-flex p-3";

            btnContainer.innerHTML = `
                <button class="btn btn-outline-secondary view-details-btn border-0" title="View Details">
                <i class="bi bi-info-circle"></i>
                </button>
                <button class="btn btn-outline-secondary edit-btn border-0" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-secondary delete-btn border-0" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            `;

            bookmarkLi.append(btnContainer);

            list.append(bookmarkLi);
        });

        return list;
    }
}
