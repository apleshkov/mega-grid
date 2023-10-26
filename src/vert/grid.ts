import { Cell } from "../cell";
import { Point, Size } from "../geometry";
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
            right: 0;
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
            c.update(col + row * sizing.colCount);
            c.setHidden(false);
        });
        this.map.set(row, cells);
    }

    setViewSize(width: number, height: number) {
        if (this.sizing.setViewSize(new Size(width, height))) {
            const content = this.content;
            const scrollable = this.scrollable;
            content.replaceChildren();
            this.map.clear();
            this.scroller = new Scroller(
                this.sizing,
                this.overscan,
                this.fillQueue.bind(this),
                this.enqueueRow.bind(this),
                this.dequeueRow.bind(this),
                scrollable.scrollTop
            );
            scrollable.style.width = `${width}px`;
            scrollable.style.height = `${height}px`;
            content.style.height = `${this.sizing.contentSize.height}px`;
        }
    }

    setItemCount(count: number) {
        if (this.sizing.setItemCount(count)) {
            this.content.style.height = `${this.sizing.contentSize.height}px`;
            this.scroller.scroll(this.scrollTop);
        }
    }

    addContentOverlay<T extends Node>(overlay: T): T {
        return this.content.insertBefore(overlay, this.content.firstChild);
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
        this.disconnect();
        this.scrollable.remove();
    }

    disconnect() {
        this.abortController.abort();
    }

    get scrollTop(): number {
        return this.scrollable.scrollTop;
    }

    onScroll(cb: () => void) {
        this.scrollable.addEventListener(
            "scroll",
            () => cb(),
            { signal: this.abortController.signal, passive: true }
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
