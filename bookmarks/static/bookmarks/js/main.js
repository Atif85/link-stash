import { setStashState } from "./state.js";
import { initSidebar } from "./sidebar/sidebarController.js";
import { rebuildTree } from "./sidebar/treeRenderer.js";
import { initTreeInteraction } from "./sidebar/treeController.js";
import { initSearch } from "./search/searchController.js";
import { initMainContentInteraction } from "./mainContent/mainContentController.js";

document.addEventListener("DOMContentLoaded", () => {
    initSidebar();

    // Make fetch request for folders and bookmarks
    fetch("/api/stash")
        .then((response) => response.json())
        .then((data) => {
            // Set the intial state
            setStashState(data.folders, data.bookmarks);

            // Build the initial tree from the fetched data
            rebuildTree();

            // Init tree interaction like collpase/expand, drag/drop
            initTreeInteraction();

            // Start listening for searching
            initSearch();

            // Init interaction for main content
            initMainContentInteraction();

        });
});
