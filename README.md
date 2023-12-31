# mega-grid

Virtualized lists & grids with unlimited number of rows and columns to display any amount of data.

<img src="https://github.com/apleshkov/mega-grid/blob/main/demo.gif" width="656" height="240" alt="Demo" />

## Features

* Vertical & horizontal scroll
* Auto item sizing using col/row count
* Auto col/row count using static item size
* [Resizable](#resizing) views
* Updatable item count (useful for e.g. [infinite scroll](#infinite-scroll))
* Animated (or instant) scroll to any item by index using different positioning (see `Grid.scrollToItem`)
* Animated (or instant) scroll to the end (see `Grid.scrollToEnd`)
* Custom item [focusing](#focusing)
* 0 dependencies (only dev ones)
* Written in Typescript
* No specific CSS
* Friendly builder API

## Installation

```
npm i mega-grid
```

## Basic Usage

Vertical grid with **3 columns** to show 100,000 items.
```js
import { vert } from "mega-grid";

vert
    .grid(
        300, // width
        400  // height
    )
    .cols({
        count: 3,
        itemHeight: 60,
        colSpacing: 2,
        rowSpacing: 2
    })
    .withCell(() => {
        // Cell factory
        const c = document.createElement("div");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(item) {
                c.innerHTML = `Item #${item}`;
            },
        };
    })
    .contentInset(2) // content inset (padding) in px
    .itemCount(100000)
    .insertTo(document.getElementById("app"));
```

Horizontal **list** (just 1 row) to show 100,000 items.
```js
import { horz } from "mega-grid";

horz
    .grid(
        500, // width
        100  // height
    )
    .rows({
        count: 1,
        itemWidth: 60,
        colSpacing: 2
    })
    .withCell(() => {
        // Cell factory
        const c = document.createElement("div");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(item) {
                c.innerHTML = `Item #${item}`;
            },
        };
    })
    .contentInset(2) // content inset (padding) in px
    .itemCount(100000)
    .insertTo(document.getElementById("app"));
```

Vertical grid with **static item size** to show 100,000 items.
```js
import { vert } from "mega-grid";

vert
    .grid(100, 100)
    .itemSize({
        width: 40,
        height: 60,
        rowSpacing: 2
    })
    .withCell(() => {
        // Cell factory
        const c = document.createElement("div");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(item) {
                c.innerHTML = `Item #${item}`;
            },
        };
    })
    .contentInset(2) // content inset (padding) in px
    .itemCount(100000)
    .insertTo(document.getElementById("app"));
```

## Focusing

**Refreshing**: update focus position and refresh the grid.
```js
import { vert } from "mega-grid";

let cursor = 0;

const grid = vert
    .grid(500, 400)
    .cols({ count: 1 }) // just 1 col for the sake of simplicity
    .withCell(() => {
        // Cell factory
        const c = document.createElement("div");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(item) {
                let html = `Item #${item}`;
                if (item === cursor) {
                    html = `<strong>${html}</strong>`;
                }
                c.innerHTML = html;
            },
        };
    })
    .insertTo(document.body);

function syncFocus(animated = true) {
    grid.refresh();
    grid.scrollToItem(cursor, animated, "middle");
}
syncFocus(false);

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "ArrowUp":
            e.preventDefault();
            cursor = Math.max(0, cursor - 1);
            syncFocus();
            break;
        case "ArrowDown":
            e.preventDefault();
            cursor = Math.min(grid.sizeInfo.rowCount - 1, cursor + 1);
            syncFocus();
            break;
    }
});
```

Using **content overlays**: moving an element along the grid.
```js
import { vert } from "mega-grid";

const grid = vert
    .grid(500, 400)
    .cols({ count: 1 }) // just 1 col for the sake of simplicity
    .withCell(...)
    .insertTo(document.body);

const sizeInfo = grid.sizeInfo;
const itemSize = sizeInfo.itemSize;

const focus = document.createElement("div");
focus.style.cssText = `
    border: 3px solid blue;
    position: absolute;
    width: ${itemSize.width - 6}px;
    height: ${itemSize.height - 6}px;
    top: ${sizeInfo.contentInset.top}px;
    z-index: 1;
`;
grid.addContentOverlay(focus);

let cursor = 0;
function syncFocus(animated = true) {
    const left = grid.originOfItem(cursor).x;
    focus.style.left = left + "px";
    grid.scrollToItem(cursor, animated, "middle");
}
syncFocus(false);

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "ArrowUp":
            e.preventDefault();
            cursor = Math.max(0, cursor - 1);
            syncFocus();
            break;
        case "ArrowDown":
            e.preventDefault();
            cursor = Math.min(sizeInfo.rowCount - 1, cursor + 1);
            syncFocus();
            break;
    }
});
```

## Infinite Scroll

You can achieve an infinite scroll behavior by updating grid's item count via the `setItemCount` method.

This [example](https://github.com/apleshkov/mega-grid/tree/main/examples/infinite) loads next page when reaches the bottom edge of the scrollable area:
<img src="https://github.com/apleshkov/mega-grid/blob/main/examples/infinite/demo.gif" width="520" height="408" alt="Infinite Scroll Demo" />

## Resizing

It's possible to update grid's view size via the `setViewSize` method.

Every sizing strategy reflects that change in a different way:
* column count and spacing are updated for **constant item size** (both vertical & horizontal)
* cell width is updated for **constant column count** (vertical only)
* cell height is updated for **constant row count** (horizontal only)

You can find an example of resizing vertical grid and contant item sizes [here](https://github.com/apleshkov/mega-grid/tree/main/examples/resizing):
<img src="https://github.com/apleshkov/mega-grid/blob/main/examples/resizing/demo.gif" width="688" height="552" alt="Resizing Demo" />
