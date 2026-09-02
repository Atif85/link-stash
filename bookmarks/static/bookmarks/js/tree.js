import { getFolders, getBookmarks } from "./state.js";

export function rebuildTree() {
    const folders = getFolders();
    const bookmarks = getBookmarks();

    // Make map for faster indexing
    const foldersByID = {};
    for (const folder of folders) {
        foldersByID[folder.id] = folder;
    }

    const bookmarksByID = {};
    for (const bookmark of bookmarks) {
        bookmarksByID[bookmark.id] = bookmark;
    }

    // Clear the root list
    const rootList = document.getElementById("root-list");
    rootList.innerHTML = "";

    // Find the root folder
    const rootFolder = folders.find(
        (f) => f.name === "Root" && f.parent_id === null,
    );

    if (!rootFolder) {
        console.error("Root folder missing!");
        return;
    }

    // Recuresively render the children of the root folder
    renderFolderChildren(
        rootFolder.children_order,
        rootList,
        foldersByID,
        bookmarksByID,
    );
}

function renderFolder(folderID, foldersByID, bookmarksByID) {
    const folder = foldersByID[folderID];
    if (!folder) return;

    const childOrder = folder.children_order;
    const hasChildren = childOrder.length > 0;

    // Create the folder
    const [folderElement, folderList] = createTreeFolder(
        folder.name,
        hasChildren,
    );

    //console.log(`--- Rendering Folder: ${folder.name} ---`)

    renderFolderChildren(childOrder, folderList, foldersByID, bookmarksByID);

    return folderElement;
}

function renderFolderChildren(
    childOrderList,
    parentElement,
    foldersByID,
    bookmarksByID,
) {
    for (const item of childOrderList) {
        const type = item[0];
        const id = parseInt(item.slice(2), 10);

        // Folder case
        if (type === "f") {
            parentElement.append(renderFolder(id, foldersByID, bookmarksByID));
        }
        // Bookmark case
        else {
            const bookmark = bookmarksByID[id];
            if (!bookmark) continue;

            parentElement.append(createTreeBookmark(bookmark.title));
        }
    }
}

// Helpers for creating the html elements
function createTreeBookmark(title) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <a class="tree-item">
            <i class="bi bi-link-45deg tree-bookmark-icon"></i>
            <span>${title}</span>
        </a>
    `;

    return listItem;
}

function createTreeFolder(name, expandable) {
    const listItem = document.createElement("li");
    listItem.className =
        "tree-folder folder-expanded" +
        (expandable ? "" : " folder-empty");

    listItem.innerHTML = `
        <div class="tree-item">
            <i class="bi bi-caret-right-fill tree-caret-icon"></i>
            <i class="bi bi-folder-fill tree-folder-icon"></i>
            <span> ${name} </span>
        </div>
    `;

    const folderList = createTreeList();
    listItem.append(folderList);

    return [listItem, folderList];
}

function createTreeList() {
    const list = document.createElement("ul");
    list.className = "tree-list";
    return list;
}
