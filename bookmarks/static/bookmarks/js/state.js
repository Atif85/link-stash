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
    appState.activeItem = { type, id };
}

export function getActiveItem() {
    return appState.activeItem;
}
