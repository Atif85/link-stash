// Flat lists of folders and bookmarks
const appState = {
    folders: [],
    bookmarks: [],
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
