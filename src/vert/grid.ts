import { Cell } from "../cell";
import { Inset, Point, Size } from "../geometry";
import { Griding } from "../griding";
import { ScrollingCell, cellLeft, cellTop } from "../scrolling";
import { SizeInfo, Sizing } from "../sizing";
import { Scroller } from "./scroller";

export type ScrollPositioning = "top" | "center" | "bottom";

export class Grid<C extends Cell = Cell> implements Griding<C> {

    private sizing: Sizing;
    private createCell: () => C;
    private overscan: number;

    private content: HTMLElement;
    private contentOverlay?: HTMLElement;
    private scrollable: HTMLElement;

    private queue: ScrollingCell<C>[][] = [];
    private map: Map<number, ScrollingCell<C>[]> = new Map();
    private scroller: Scroller;

    private abortController = new AbortController();

    get sizeInfo(): SizeInfo {
        return this.sizing;
    }

    constructor(
        sizing: Sizing,
        createCell: () => C,
        overscan: number,
        className?: string
    ) {
        this.sizing = sizing;
        this.overscan = overscan;
        const scrollable = document.createElement("div");
        if (className) {
            scrollable.className = className;
        }
        scrollable.style.cssText = `
            position: relative;
            overflow-x: hidden;
            overflow-y: auto;
            width: ${sizing.viewSize.width}px;
            height: ${sizing.viewSize.height}px;
        `;
        this.scrollable = scrollable;
        const content = document.createElement("div");
        content.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${sizing.contentSize.width}px;
            height: ${sizing.contentSize.height}px;
        `;
        scrollable.appendChild(content);
        this.content = content;
        this.createCell = createCell;
        this.scroller = new Scroller(
            sizing,
            overscan,
            this.fillQueue.bind(this),
            this.enqueueRow.bind(this),
            this.dequeueRow.bind(this),
            0
        );
        this.scrollable.addEventListener(
            "scroll",
            () => this.scroller.scroll(this.scrollable.scrollTop),
            { signal: this.abortController.signal, passive: true }
        );
    }

    private fillQueue(len: number) {
        const frag = document.createDocumentFragment();
        this.queue = Array.from({ length: len });
        for (let row = 0; row < len; row += 1) {
            const cells = Array.from(
                { length: this.sizing.colCount },
                (_, col) => {
                    const c = new ScrollingCell(
                        this.createCell(),
                        cellLeft(col, this.sizing),
                        cellTop(row, this.sizing),
                        this.sizing.itemSize
                    );
                    c.setHidden(true);
                    c.appendTo(frag);
                    return c;
                }
            );
            this.queue[row] = cells;
        }
        this.content.appendChild(frag);
    }

    private enqueueRow(row: number) {
        const cells = this.map.get(row);
        if (!cells) {
            return;
        }
        this.map.delete(row);
        cells.forEach((c) => {
            c.willReuse();
            c.setHidden(true);
        });
        this.queue.push(cells);
    }

    private dequeueRow(row: number) {
        if (this.map.has(row)) {
            return;
        }
        const cells = this.queue.pop();
        if (!cells) {
            throw new Error(`Queue is empty`);
        }
        const sizing = this.sizing;
        const top = cellTop(row, sizing);
        cells.forEach((c, col) => {
            c.setTop(top);
            const item = col + row * sizing.colCount;
            if (item < sizing.itemCount) {
                c.update(item);
                c.setHidden(false);
            }
        });
        this.map.set(row, cells);
    }

    private unmountAllCells() {
        this.queue.forEach((a) => a.forEach((c) => c.unmount()));
        this.map.forEach((a) => a.forEach((c) => c.unmount()));
    }

    setViewSize(width: number, height: number) {
        const oldSize = this.sizing.viewSize;
        if (oldSize.width !== width || oldSize.height !== height) {
            const newSize = new Size(width, height);
            this.setSizing(this.sizing.newViewSize(newSize));
        }
    }

    setContentInset(inset: Inset) {
        if (!this.sizing.contentInset.equals(inset)) {
            this.setSizing(this.sizing.newContentInset(inset));
        }
    }

    setItemCount(count: number) {
        if (this.sizing.itemCount !== count) {
            this.setSizing(this.sizing.newItemCount(count));
        }
    }

    private setSizing(newSizing: Sizing) {
        this.sizing = newSizing;
        this.unmountAllCells();
        this.queue = [];
        this.map.clear();
        const { content, scrollable, contentOverlay } = this;
        content.replaceChildren();
        this.scroller = new Scroller(
            this.sizing,
            this.overscan,
            this.fillQueue.bind(this),
            this.enqueueRow.bind(this),
            this.dequeueRow.bind(this),
            scrollable.scrollTop
        );
        const { viewSize, contentSize } = this.sizing;
        scrollable.style.width = `${viewSize.width}px`;
        scrollable.style.height = `${viewSize.height}px`;
        content.style.width = `${contentSize.width}px`;
        content.style.height = `${contentSize.height}px`;
        if (contentOverlay) {
            contentOverlay.style.width = `${contentSize.width}px`;
            contentOverlay.style.height = `${contentSize.height}px`;
        }
    }

    addContentOverlay<T extends Node>(node: T): T {
        let overlay = this.contentOverlay;
        if (!overlay) {
            overlay = document.createElement("div");
            const { contentSize } = this.sizing;
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${contentSize.width}px;
                height: ${contentSize.height}px;
            `;
            this.scrollable.appendChild(overlay);
            this.contentOverlay = overlay;
        }
        return overlay.insertBefore(node, overlay.firstChild);
    }

    refresh() {
        const colCount = this.sizing.colCount;
        this.map.forEach((cells, row) => (
            cells.forEach((c, col) => (
                c.update(col + row * colCount)
            ))
        ));
    }

    insertTo(target: Node, beforeNode: Node | null = null) {
        target.insertBefore(this.scrollable, beforeNode);
    }

    remove() {
        this.unmount(true);
    }

    unmount(removing = false) {
        this.abortController.abort();
        this.unmountAllCells();
        if (removing) {
            this.scrollable.remove();
        }
    }

    get scrollTop(): number {
        return this.scrollable.scrollTop;
    }

    onScroll(
        cb: () => void,
        options?: {
            once?: boolean
            signal?: AbortSignal
        }
    ): void {
        this.scrollable.addEventListener(
            "scroll",
            () => cb(),
            {
                signal: options?.signal ?? this.abortController.signal,
                once: options?.once,
                passive: true
            }
        );
    }

    scrollBy(offset: number, animated: boolean) {
        this.scrollable.scrollBy({
            top: offset,
            behavior: animated ? "smooth" : "instant"
        });
    }

    scrollTo(position: number, animated: boolean) {
        this.scrollable.scrollTo({
            top: position,
            behavior: animated ? "smooth" : "instant"
        });
    }

    scrollToEnd(animated: boolean): void {
        const sizing = this.sizing;
        const top = Math.max(0, sizing.contentSize.height - sizing.viewSize.height);
        this.scrollTo(top, animated);
    }

    scrollToItem(
        item: number,
        animated: boolean,
        positioning: ScrollPositioning = "center"
    ) {
        let top = this.originOfItem(item).y;
        const sizing = this.sizing;
        switch (positioning) {
            case "top":
                break;
            case "center":
                top += sizing.itemSize.height / 2;
                top += sizing.spacing.interRow / 2;
                top -= sizing.viewSize.height / 2;
                top = Math.max(0, Math.min(sizing.contentSize.height, top));
                break;
            case "bottom":
                top += sizing.itemSize.height + sizing.spacing.interRow;
                top -= sizing.viewSize.height;
                top = Math.max(0, Math.min(sizing.contentSize.height, top));
                break;
            default:
                throw new Error(`Invalid scroll positioning: ${positioning}`);
        }
        this.scrollTo(top, animated);
    }

    originOfItem(item: number): Point {
        const sizing = this.sizing;
        const row = Math.floor(item / sizing.colCount);
        const col = item % sizing.colCount;
        const x = cellLeft(col, sizing);
        const y = cellTop(row, sizing);
        return new Point(x, y);
    }

    isVisibleItem(item: number): boolean {
        const row = Math.floor(item / this.sizing.colCount);
        return this.map.has(row);
    }

    forEachVisibleCell(fn: (cell: C, col: number, row: number) => void): void {
        this.map.forEach((cells, row) => {
            cells.forEach((entry, col) => (
                fn(entry.content, col, row)
            ));
        })
    }
}
