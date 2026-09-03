import { setStashState } from "./state.js";
import { initSidebar } from "./sidebar.js";
import { rebuildTree } from "./tree.js";
import { initInteraction } from "./interaction.js";

document.addEventListener("DOMContentLoaded", () => {
    initSidebar();

    // Make fetch request for folders and bookmarks
    fetch("/api/stash")
        .then((response) => response.json())
        .then((data) => {
            // Set the intial state
            setStashState(data.folders, data.bookmarks);
            rebuildTree();
            initInteraction();
        });
});
