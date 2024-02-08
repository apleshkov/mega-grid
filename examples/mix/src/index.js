import { vert, horz } from "mega-grid";

const totalCount = 10_000;

((target) => {
    const cellTpl = document.createElement("template");
    cellTpl.innerHTML = '<div class="cell"><div class="cell-content"></div></div>';
    const grid = vert.grid(300, 400)
        .cols({ count: 1, itemHeight: 60, rowSpacing: 2 })
        .withCell(() => {
            const c = cellTpl.content.cloneNode(true);
            const content = c.firstChild.firstChild;
            return {
                renderTo(container) {
                    container.appendChild(c);
                },
                update(item) {
                    content.innerText = `Item #${item}`;
                },
            };
        })
        .contentInset(2)
        .itemCount(totalCount)
        .insertTo(target.querySelector(".list-container"));

    const sizeInfo = grid.sizeInfo;
    const itemSize = sizeInfo.itemSize;

    const focus = document.createElement("div");
    focus.style.cssText = `
        border: 3px solid blue;
        position: absolute;
        width: ${itemSize.width - 6}px;
        height: ${itemSize.height - 6}px;
        left: ${sizeInfo.contentInset.left}px;
    `;
    grid.addContentOverlay(focus);

    let cursor = 0;
    function syncFocus(animated = true) {
        const top = grid.originOfItem(cursor).y;
        focus.style.top = top + "px";
        grid.scrollToItem(cursor, animated, "center");
    }
    syncFocus(false);

    target.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.hasAttribute("data-scroll-top")) {
            grid.scrollTo(0, true);
        } else if (target.hasAttribute("data-scroll-center")) {
            grid.scrollToItem(totalCount / 2, true);
        } else if (target.hasAttribute("data-scroll-bottom")) {
            grid.scrollToEnd(true);
        } else if (target.hasAttribute("data-move-up")) {
            cursor = Math.max(0, cursor - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-down")) {
            cursor = Math.min(sizeInfo.rowCount - 1, cursor + 1);
            syncFocus();
        }
    });
})(document.getElementById("vert-list"));

((target) => {
    let cursor = {
        col: 0,
        row: 0,
        get item() {
            return this.row * 2 + this.col;
        }
    };

    const cellTpl = document.createElement("template");
    cellTpl.innerHTML = '<div class="cell"><div class="cell-content"></div></div>';

    const grid = vert.grid(300, 400)
        .cols({ count: 2, itemHeight: 60, colSpacing: 2, rowSpacing: 2 })
        .withCell(() => {
            const c = cellTpl.content.cloneNode(true);
            const content = c.firstChild.firstChild;
            return {
                renderTo(container) {
                    container.appendChild(c);
                },
                update(item) {
                    const v = `Item #${item}`;
                    if (item === cursor.item) {
                        content.innerHTML = `
                            <span 
                                style="border: 1px solid red; font-weight: bold;"
                            >${v}</span>
                        `;
                    } else {
                        content.innerText = v;
                    }
                },
            };
        })
        .contentInset(2)
        .itemCount(totalCount)
        .insertTo(target.querySelector(".list-container"));

    const sizeInfo = grid.sizeInfo;

    function syncFocus(animated = true) {
        const i = cursor.item;
        grid.refresh();
        grid.scrollToItem(i, animated, "center");
    }
    syncFocus(false);

    target.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.hasAttribute("data-scroll-top")) {
            grid.scrollTo(0, true);
        } else if (target.hasAttribute("data-scroll-center")) {
            grid.scrollToItem(totalCount / 2, true);
        } else if (target.hasAttribute("data-scroll-bottom")) {
            grid.scrollToEnd(true);
        } else if (target.hasAttribute("data-move-left")) {
            cursor.col = Math.max(0, cursor.col - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-up")) {
            cursor.row = Math.max(0, cursor.row - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-down")) {
            cursor.row = Math.min(sizeInfo.rowCount - 1, cursor.row + 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-right")) {
            cursor.col = Math.min(sizeInfo.colCount - 1, cursor.col + 1);
            syncFocus();
        }
    });
})(document.getElementById("vert-grid"));

((target) => {
    const cellTpl = document.createElement("template");
    cellTpl.innerHTML = '<div class="cell"><div class="cell-content"></div></div>';
    const grid = horz.grid(650, 100)
        .rows({ count: 1, itemWidth: 80, colSpacing: 2 })
        .withCell(() => {
            const c = cellTpl.content.cloneNode(true);
            const content = c.firstChild.firstChild;
            return {
                renderTo(container) {
                    container.appendChild(c);
                },
                update(item) {
                    content.innerText = `Item #${item}`;
                },
            };
        })
        .contentInset(2)
        .itemCount(totalCount)
        .insertTo(target.querySelector(".list-container"));

    const sizeInfo = grid.sizeInfo;
    const itemSize = sizeInfo.itemSize;

    const focus = document.createElement("div");
    focus.style.cssText = `
        border: 3px solid blue;
        position: absolute;
        width: ${itemSize.width - 6}px;
        height: ${itemSize.height - 6}px;
        top: ${sizeInfo.contentInset.top}px;
    `;
    grid.addContentOverlay(focus);

    let cursor = 0;
    function syncFocus(animated = true) {
        const left = grid.originOfItem(cursor).x;
        focus.style.left = left + "px";
        grid.scrollToItem(cursor, animated, "center");
    }
    syncFocus(false);

    target.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.hasAttribute("data-scroll-left")) {
            grid.scrollTo(0, true);
        } else if (target.hasAttribute("data-scroll-center")) {
            grid.scrollToItem(totalCount / 2, true);
        } else if (target.hasAttribute("data-scroll-right")) {
            grid.scrollToEnd(true);
        } else if (target.hasAttribute("data-move-left")) {
            cursor = Math.max(0, cursor - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-right")) {
            cursor = Math.min(sizeInfo.colCount - 1, cursor + 1);
            syncFocus();
        }
    });
})(document.getElementById("horz-list"));

((target) => {
    let cursor = {
        col: 0,
        row: 0,
        get item() {
            return this.col * 2 + this.row;
        }
    };

    const cellTpl = document.createElement("template");
    cellTpl.innerHTML = '<div class="cell"><div class="cell-content"></div></div>';

    const grid = horz.grid(650, 200)
        .rows({ count: 2, itemWidth: 95, colSpacing: 2, rowSpacing: 2 })
        .withCell(() => {
            const c = cellTpl.content.cloneNode(true);
            const content = c.firstChild.firstChild;
            return {
                renderTo(container) {
                    container.appendChild(c);
                },
                update(item) {
                    const v = `Item #${item}`;
                    if (item === cursor.item) {
                        content.innerHTML = `
                            <span 
                                style="border: 1px solid red; font-weight: bold;"
                            >${v}</span>
                        `;
                    } else {
                        content.innerText = v;
                    }
                },
            };
        })
        .contentInset(2)
        .itemCount(totalCount)
        .insertTo(target.querySelector(".list-container"));

    const sizeInfo = grid.sizeInfo;

    function syncFocus(animated = true) {
        const i = cursor.item;
        grid.refresh();
        grid.scrollToItem(i, animated, "center");
    }
    syncFocus(false);

    target.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.hasAttribute("data-scroll-left")) {
            grid.scrollTo(0, true);
        } else if (target.hasAttribute("data-scroll-center")) {
            grid.scrollToItem(totalCount / 2, true);
        } else if (target.hasAttribute("data-scroll-right")) {
            grid.scrollToEnd(true);
        } else if (target.hasAttribute("data-move-left")) {
            cursor.col = Math.max(0, cursor.col - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-up")) {
            cursor.row = Math.max(0, cursor.row - 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-down")) {
            cursor.row = Math.min(sizeInfo.rowCount - 1, cursor.row + 1);
            syncFocus();
        } else if (target.hasAttribute("data-move-right")) {
            cursor.col = Math.min(sizeInfo.colCount - 1, cursor.col + 1);
            syncFocus();
        }
    });
})(document.getElementById("horz-grid"));
