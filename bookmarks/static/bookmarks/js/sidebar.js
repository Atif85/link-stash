export function initSidebar() {
    // Get the resizer and sidebar elements
    const sidebar = document.getElementById("sidebar");
    const resizer = document.getElementById("sidebar-resizer");
    const STORAGE_KEY = "sidebar-width";

    if (!sidebar || !resizer) return;

    // Try to set width from LocalStorage
    const savedWidth = localStorage.getItem(STORAGE_KEY);
    if (savedWidth !== null) {
        const parsedWidth = Number(savedWidth);
        if (!Number.isNaN(parsedWidth)) {
            setClampedWidth(parsedWidth);
        }
    }

    // Add the event listenser for Drag Start
    resizer.addEventListener("mousedown", (event) => {
        event.preventDefault();

        // When dragging globally set the cursor to col-resize and prevent selecting.
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
    });

    function onMouseUp() {
        // Reset cursor and userselect
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        // Remove event listeners
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);

        const currentWidth = Number.parseFloat(sidebar.style.width);
        if (!Number.isNaN(currentWidth)) {
            localStorage.setItem(STORAGE_KEY, String(Math.round(currentWidth)));
        }
    }

    function onMouseMove(event) {
        setClampedWidth(event.clientX);
    }

    function setClampedWidth(width) {
        const minWidth = 200;
        const maxWidth = 550;

        const newWidth = Math.min(Math.max(Number(width), minWidth), maxWidth);

        sidebar.style.width = `${newWidth}px`;
        return newWidth;
    }
}