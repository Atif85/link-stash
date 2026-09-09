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
    } else {
        appState.bookmarks[index] = bookmark;
    }
}

export function removeBookmark(bookmark) {
    if (!bookmark) return;
    const index = appState.bookmarks.findIndex((b) => b.id === bookmark.id);

    if (index !== -1) {
        appState.bookmarks.splice(index, 1);
    }
}
