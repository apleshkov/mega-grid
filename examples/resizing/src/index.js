import { vert } from "mega-grid";

const container = document.getElementById("container");

const grid = vert
    .grid(container.clientWidth, container.clientHeight)
    .itemSize({ width: 90, height: 90, rowSpacing: 5, minColSpacing: 5 })
    .withCell(() => {
        const cell = document.createElement("div");
        cell.className = "cell";
        const content = cell.appendChild(
            document.createElement("div")
        );
        content.className = "cell-content";
        return {
            renderTo(container) {
                container.appendChild(cell);
            },
            update(item) {
                content.innerText = `Item #${item}`;
            },
        };
    })
    .itemCount(10_000)
    .contentInset(5)
    .insertTo(container);

const frame = document.getElementById("frame");
const anchor = document.getElementById("anchor");

function syncAnchor() {
    const rect = container.getBoundingClientRect();
    anchor.style.left = `${rect.right}px`;
    anchor.style.top = `${rect.bottom}px`;
}

syncAnchor();

function syncFrame(x, y) {
    const rect = container.getBoundingClientRect();
    frame.style.left = `${rect.left}px`;
    frame.style.top = `${rect.top}px`;
    const width = Math.max(100, x - rect.left);
    const height = Math.max(100, y - rect.top);
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
}

let isResizing = false;
anchor.addEventListener("mousedown", (e) => {
    isResizing = true;
    syncFrame(e.clientX, e.clientY);
    frame.style.display = "block";
});
document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    syncFrame(e.clientX, e.clientY);
});
document.addEventListener("mouseup", () => {
    if (!isResizing) return;
    isResizing = false;
    const rect = frame.getBoundingClientRect();
    frame.style.display = "none";
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    syncAnchor();
    grid.setViewSize(rect.width, rect.height);
});
