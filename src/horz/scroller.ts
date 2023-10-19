import { Sizing } from "../sizing";
import { IndexRange } from "../scrolling";

export class Scroller {

    private sizing: Sizing;
    private overscan: number;
    private vrange: IndexRange;
    private enqueueCol: (col: number) => void;
    private dequeueCol: (col: number) => void;

    constructor(
        sizing: Sizing,
        overscan: number,
        createCols: (len: number) => void,
        enqueueCol: (col: number) => void,
        dequeueCol: (col: number) => void,
        left: number
    ) {
        this.sizing = sizing;
        this.overscan = overscan;
        createCols(visibleCount(sizing) + 1 + overscan * 2);
        this.enqueueCol = enqueueCol;
        this.dequeueCol = dequeueCol;
        const range = visibleRange(left, sizing, overscan);
        for (let i = range.start; i <= range.end; i += 1) {
            dequeueCol(i);
        }
        this.vrange = range;
    }

    scroll(left: number) {
        const prevRange = this.vrange;
        const range = visibleRange(left, this.sizing, this.overscan);
        if (range.start === prevRange.start && range.end === prevRange.end) {
            return;
        }
        for (let i = prevRange.start; i <= prevRange.end; i += 1) {
            if (i < range.start || i > range.end) {
                this.enqueueCol(i);
            }
        }
        for (let i = range.start; i <= range.end; i += 1) {
            if (i < prevRange.start || i > prevRange.end) {
                this.dequeueCol(i);
            }
        }
        this.vrange = range;
    }
}

function visibleCount(sizing: Sizing): number {
    const viewWidth = sizing.viewSize.width;
    const inset = sizing.contentInset.left;
    const itemWidth = sizing.itemSize.width;
    const spacing = sizing.spacing.interCol;
    return Math.ceil(
        (viewWidth - inset) / (itemWidth + spacing)
    );
}

function visibleRange(left: number, sizing: Sizing, overscan: number): IndexRange {
    const itemWidth = sizing.itemSize.width;
    const spacing = sizing.spacing.interCol;
    const viewWidth = sizing.viewSize.width;
    const offset = Math.max(0, left - sizing.contentInset.left);
    const start = Math.floor(
        offset / (itemWidth + spacing)
    );
    let end = Math.ceil(
        (offset + viewWidth) / (itemWidth + spacing)
    );
    end = Math.max(end - 1, start);
    return new IndexRange(
        Math.max(start - overscan, 0),
        Math.min(end + overscan, sizing.colCount - 1)
    );
}
