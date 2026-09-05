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
            if (f.id === id) return true;
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

    function renderBookmarkView() {}

    function renderDefaultView() {}

    function createBookmarkList(bookmarks, isSearch=false) {
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

            bookmarkLi.append(btnContainer)

            list.append(bookmarkLi);
        });

        return list;
    }
}
