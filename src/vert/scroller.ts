import { Sizing } from "../sizing";
import { IndexRange } from "../scrolling";

export class Scroller {

    private sizing: Sizing;
    private overscan: number;
    private vrange: IndexRange;
    private enqueueRow: (row: number) => void;
    private dequeueRow: (row: number) => void;

    constructor(
        sizing: Sizing,
        overscan: number,
        createRows: (len: number) => void,
        enqueueRow: (row: number) => void,
        dequeueRow: (row: number) => void,
        top: number
    ) {
        this.sizing = sizing;
        this.overscan = overscan;
        createRows(visibleCount(sizing) + 1 + overscan * 2);
        this.enqueueRow = enqueueRow;
        this.dequeueRow = dequeueRow;
        const range = visibleRange(top, sizing, overscan);
        for (let i = range.start; i <= range.end; i += 1) {
            dequeueRow(i);
        }
        this.vrange = range;
    }

    scroll(top: number) {
        const prevRange = this.vrange;
        const range = visibleRange(top, this.sizing, this.overscan);
        if (range.start === prevRange.start && range.end === prevRange.end) {
            return;
        }
        for (let i = prevRange.start; i <= prevRange.end; i += 1) {
            if (i < range.start || i > range.end) {
                this.enqueueRow(i);
            }
        }
        for (let i = range.start; i <= range.end; i += 1) {
            if (i < prevRange.start || i > prevRange.end) {
                this.dequeueRow(i);
            }
        }
        this.vrange = range;
    }
}

function visibleCount(sizing: Sizing): number {
    const viewHeight = sizing.viewSize.height;
    const inset = sizing.contentInset.top;
    const itemHeight = sizing.itemSize.height;
    const spacing = sizing.spacing.interRow;
    return Math.ceil(
        (viewHeight - inset) / (itemHeight + spacing)
    );
}

function visibleRange(top: number, sizing: Sizing, overscan: number): IndexRange {
    const itemHeight = sizing.itemSize.height;
    const spacing = sizing.spacing.interRow;
    const viewHeight = sizing.viewSize.height;
    const offset = Math.max(0, top - sizing.contentInset.top);
    const start = Math.floor(
        offset / (itemHeight + spacing)
    );
    let end = Math.ceil(
        (offset + viewHeight) / (itemHeight + spacing)
    );
    end = Math.max(end - 1, start);
    return new IndexRange(
        Math.max(start - overscan, 0),
        Math.min(end + overscan, sizing.rowCount - 1)
    );
}
