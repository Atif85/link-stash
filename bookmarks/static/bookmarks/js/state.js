// Flat lists of folders and bookmarks
const appState = {
    folders: [],
    bookmarks: [],
    activeItem: null,
};

export function setStashState(folders, bookmarks) {
    appState.folders = folders;
    appState.bookmarks = bookmarks;
}

export function getFolders() {
    return appState.folders;
}

export function getBookmarks() {
    return appState.bookmarks;
}

// --- Active item method ---
export function setActiveItem(type, id) {
    if (type === null || id === null) {
        appState.activeItem = null;
        return;
    }
    appState.activeItem = { type, id };
}

export function getActiveItem() {
    return appState.activeItem;
}

export function getActiveItemFolder() {
    const bookmarks = appState.bookmarks;
    const folders = appState.folders;
    const activeItem = appState.activeItem;

    // The parent folder of the active item
    let parentFolder;

    if (!activeItem) {
        const rootFolder = folders.find((f) => {
            return f.parent_id === null && f.name === "Root";
        });
        if (!rootFolder) return null;

        parentFolder = rootFolder;
    } else {
        const { type, id } = activeItem;

        // If a Folder is active
        if (type === "f") {
            const activeFolder = folders.find((f) => {
                return f.id === id;
            });
            if (!activeFolder) return null;

            parentFolder = activeFolder;
        }
        // If a Bookmark is active
        else if (type === "b") {
            const activeBookmark = bookmarks.find((b) => {
                return b.id === id;
            });
            if (!activeBookmark) return null;
            const bookmarkFolder = folders.find((f) => {
                return f.id === activeBookmark.folder_id;
            });
            if (!bookmarkFolder) return null;
            parentFolder = bookmarkFolder;
        }
    }

    return parentFolder;
}

// --- Updating bookmark methods ---
export function addOrUpdateBookmark(bookmark) {
    if (!bookmark) return;
    const index = appState.bookmarks.findIndex((b) => b.id === bookmark.id);

    if (index === -1) {
        appState.bookmarks.push(bookmark);
        addItemToFolder(bookmark.folder_id, bookmark.id, "b");
    } else {
        const previousBookmark = appState.bookmarks[index];
        appState.bookmarks[index] = bookmark;

        if (previousBookmark.folder_id !== bookmark.folder_id) {
            removeItemFromFolder(previousBookmark.folder_id, bookmark.id, "b");
            addItemToFolder(bookmark.folder_id, bookmark.id, "b");
        }
    }
}

export function removeBookmark(bookmarkId) {
    if (!bookmarkId) return;
    const index = appState.bookmarks.findIndex((b) => b.id === bookmarkId);

    if (index !== -1) {
        removeItemFromFolder(
            appState.bookmarks[index].folder_id,
            bookmarkId,
            "b",
        );
        appState.bookmarks.splice(index, 1);
    }
}

// --- Updating folder methods ---
export function addOrUpdateFolder(folder) {
    if (!folder) return;
    const index = appState.folders.findIndex((f) => f.id === folder.id);

    if (index === -1) {
        appState.folders.push(folder);
        addItemToFolder(folder.parent_id, folder.id, "f");
    } else {
        const previousFolder = appState.folders[index];
        appState.folders[index] = folder;

        if (previousFolder.parent_id !== folder.parent_id) {
            removeItemFromFolder(previousFolder.parent_id, folder.id, "f");
            addItemToFolder(folder.parent_id, folder.id, "f");
        }
    }
}

export function removeFolder(folderId) {
    if (!folderId) return;
    const index = appState.folders.findIndex((f) => f.id === folderId);

    if (index !== -1) {
        removeItemFromFolder(appState.folders[index].parent_id, folderId, "f");
        appState.folders.splice(index, 1);
    }
}

// Helpers
function addItemToFolder(folderId, id, type) {
    const folder = appState.folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (!folder.children_order) {
        folder.children_order = [];
    }

    const itemIdentifier = type === "f" ? `f_${id}` : `b_${id}`;
    if (!folder.children_order.includes(itemIdentifier)) {
        folder.children_order.push(itemIdentifier);
    }
}

function removeItemFromFolder(folderId, id, type) {
    const folder = appState.folders.find((f) => f.id === folderId);
    if (!folder || !folder.children_order) return;

    const itemIdentifier = type === "f" ? `f_${id}` : `b_${id}`;
    folder.children_order = folder.children_order.filter(
        (childId) => childId !== itemIdentifier,
    );
}
