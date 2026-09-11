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

export function addOrUpdateBookmark(bookmark) {
    if (!bookmark) return;
    const index = appState.bookmarks.findIndex((b) => b.id === bookmark.id);

    if (index === -1) {
        appState.bookmarks.push(bookmark);
        addBookmarkToFolder(bookmark.folder_id, bookmark.id);
    } else {
        const previousBookmark = appState.bookmarks[index];
        appState.bookmarks[index] = bookmark;

        if (previousBookmark.folder_id !== bookmark.folder_id) {
            removeBookmarkFromFolder(previousBookmark.folder_id, bookmark.id);
            addBookmarkToFolder(bookmark.folder_id, bookmark.id);
        }
    }
}

export function removeBookmark(bookmarkId) {
    if (!bookmarkId) return;
    const index = appState.bookmarks.findIndex((b) => b.id === bookmarkId);

    if (index !== -1) {
        removeBookmarkFromFolder(appState.bookmarks[index].folder_id, bookmarkId);
        appState.bookmarks.splice(index, 1);
    }
}

function addBookmarkToFolder(folderId, bookmarkId) {
    const folder = appState.folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (!folder.children_order) {
        folder.children_order = [];
    }

    const bookmarkIdentifier = `b_${bookmarkId}`;
    if (!folder.children_order.includes(bookmarkIdentifier)) {
        folder.children_order.push(bookmarkIdentifier);
    }
}

function removeBookmarkFromFolder(folderId, bookmarkId) {
    const folder = appState.folders.find((f) => f.id === folderId);
    if (!folder || !folder.children_order) return;

    const bookmarkIdentifier = `b_${bookmarkId}`;
    folder.children_order = folder.children_order.filter(
        (childId) => childId !== bookmarkIdentifier,
    );
}
