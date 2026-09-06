import { updateMainContent } from "../mainContent/mainContentRenderer.js";
import { getBookmarks } from "../state.js";

export function initSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", (event) => {
        // Get the query from the input
        const query = event.target.value.trim().toLowerCase();

        if (query === "") {
            updateMainContent();
            return;
        }

        const allBookmarks = getBookmarks();
        const filteredResults = allBookmarks.filter((bookmark) => {
            // Search both title and url
            const matchesTitle = bookmark.title.toLowerCase().includes(query);
            const matchesUrl = bookmark.url.toLowerCase().includes(query);

            return matchesTitle || matchesUrl;
        });

        updateMainContent(filteredResults);
    });
}
