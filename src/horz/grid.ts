import { Cell } from "../cell";
import { Point, Size } from "../geometry";
import { Griding } from "../griding";
import { ScrollingCell, cellLeft, cellTop } from "../scrolling";
import { SizeInfo, Sizing } from "../sizing";
import { Scroller } from "./scroller";

export type ScrollPositioning = "left" | "center" | "right";

export class Grid<C extends Cell = Cell> implements Griding<C> {

    private sizing: Sizing;
    private createCell: () => C;
    private overscan: number;

    private content: HTMLElement;
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
        overscan: number
    ) {
        this.sizing = sizing;
        this.overscan = overscan;
        const scrollable = document.createElement("div");
        scrollable.style.cssText = `
            position: relative;
            overflow-x: auto;
            width: ${sizing.viewSize.width}px;
            height: ${sizing.viewSize.height}px;
        `;
        this.scrollable = scrollable;
        const content = document.createElement("div");
        content.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: ${sizing.contentSize.width}px;
        `;
        scrollable.appendChild(content);
        this.content = content;
        this.createCell = createCell;
        this.scroller = new Scroller(
            sizing,
            overscan,
            this.fillQueue.bind(this),
            this.enqueueCol.bind(this),
            this.dequeueCol.bind(this),
            0
        );
        this.scrollable.addEventListener(
            "scroll",
            () => this.scroller.scroll(this.scrollable.scrollLeft),
            { signal: this.abortController.signal, passive: true }
        );
    }

    private fillQueue(len: number) {
        const frag = document.createDocumentFragment();
        this.queue = Array.from({ length: len });
        for (let col = 0; col < len; col += 1) {
            const cells = Array.from(
                { length: this.sizing.rowCount },
                (_, row) => {
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
            this.queue[col] = cells;
        }
        this.content.appendChild(frag);
    }

    private enqueueCol(col: number) {
        const cells = this.map.get(col);
        if (!cells) {
            return;
        }
        this.map.delete(col);
        cells.forEach((c) => {
            c.willReuse();
            c.setHidden(true);
        });
        this.queue.push(cells);
    }

    private dequeueCol(col: number) {
        if (this.map.has(col)) {
            return;
        }
        const cells = this.queue.pop();
        if (!cells) {
            throw new Error(`Queue is empty`);
        }
        const sizing = this.sizing;
        const left = cellLeft(col, sizing);
        cells.forEach((c, row) => {
            c.setLeft(left);
            c.update(row + col * sizing.rowCount);
            c.setHidden(false);
        });
        this.map.set(col, cells);
    }

    setViewSize(viewSize: Size) {
        if (this.sizing.setViewSize(viewSize)) {
            const content = this.content;
            const scrollable = this.scrollable;
            this.content.replaceChildren();
            this.scroller = new Scroller(
                this.sizing,
                this.overscan,
                this.fillQueue.bind(this),
                this.enqueueCol.bind(this),
                this.dequeueCol.bind(this),
                scrollable.scrollLeft
            );
            scrollable.style.width = `${viewSize.width}px`;
            scrollable.style.height = `${viewSize.height}px`;
            content.style.width = `${this.sizing.contentSize.width}px`;
        }
    }

    setItemCount(count: number) {
        if (this.sizing.setItemCount(count)) {
            this.content.style.width = `${this.sizing.contentSize.width}px`;
        }
    }

    addContentOverlay<T extends Node>(overlay: T): T {
        return this.content.insertBefore(overlay, this.content.firstChild);
    }

    refresh() {
        const rowCount = this.sizing.rowCount;
        this.map.forEach((cells, col) => (
            cells.forEach((c, row) => (
                c.update(row + col * rowCount)
            ))
        ));
    }

    insertTo(target: Node, beforeNode: Node | null = null) {
        target.insertBefore(this.scrollable, beforeNode);
    }

    remove() {
        this.disconnect();
        this.scrollable.remove();
    }

    disconnect() {
        this.abortController.abort();
    }

    get scrollLeft(): number {
        return this.scrollable.scrollLeft;
    }

    onScroll(cb: () => void): void {
        this.scrollable.addEventListener(
            "scroll",
            () => cb(),
            { signal: this.abortController.signal, passive: true }
        );
    }

    scrollBy(offset: number, animated: boolean) {
        this.scrollable.scrollBy({
            left: offset,
            behavior: animated ? "smooth" : "instant"
        });
    }

    scrollTo(position: number, animated: boolean) {
        this.scrollable.scrollTo({
            left: position,
            behavior: animated ? "smooth" : "instant"
        });
    }

    scrollToEnd(animated: boolean): void {
        const sizing = this.sizing;
        const left = Math.max(0, sizing.contentSize.width - sizing.viewSize.width);
        this.scrollTo(left, animated);
    }

    scrollToItem(
        item: number,
        animated: boolean,
        positioning: ScrollPositioning = "center"
    ) {
        let left = this.originOfItem(item).x;
        const sizing = this.sizing;
        switch (positioning) {
            case "left":
                break;
            case "center":
                left += sizing.itemSize.width / 2;
                left += sizing.spacing.interCol / 2;
                left -= sizing.viewSize.width / 2;
                left = Math.max(0, Math.min(sizing.contentSize.width, left));
                break;
            case "right":
                left += sizing.itemSize.width + sizing.spacing.interCol;
                left -= sizing.viewSize.width;
                left = Math.max(0, Math.min(sizing.contentSize.width, left));
                break;
            default:
                throw new Error(`Invalid scroll positioning: ${positioning}`);
        }
        this.scrollTo(left, animated);
    }

    originOfItem(item: number): Point {
        const sizing = this.sizing;
        const col = Math.floor(item / sizing.rowCount);
        const row = item % sizing.rowCount;
        const x = cellLeft(col, sizing);
        const y = cellTop(row, sizing);
        return new Point(x, y);
    }

    isVisibleItem(item: number): boolean {
        const col = item % this.sizing.colCount;
        return this.map.has(col);
    }

    forEachVisibleCell(fn: (cell: C, col: number, row: number) => void): void {
        this.map.forEach((cells, col) => {
            cells.forEach((entry, row) => (
                fn(entry.content, col, row)
            ));
        })
    }
}
