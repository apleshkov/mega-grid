import { Cell } from "./cell";
import { Size } from "./geometry";
import { Sizing } from "./sizing";

export class IndexRange {

    constructor(
        public start: number,
        public end: number
    ) { }
}

export class ScrollingCell<C extends Cell> {

    readonly content: C;
    private wrapper: HTMLElement;

    constructor(content: C, left: number, top: number, size: Size) {
        this.content = content;
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
            position: absolute;
            width: ${size.width}px;
            height: ${size.height}px;
            left: ${left}px;
            top: ${top}px;
        `;
        this.wrapper = wrapper;
        content.renderTo(wrapper);
    }

    appendTo(target: Node) {
        target.appendChild(this.wrapper);
    }

    update(item: number) {
        this.content.update(item, this.wrapper);
    }

    willReuse() {
        this.content.willReuse?.();
    }

    unmount() {
        this.content.unmount?.();
    }

    setLeft(left: number) {
        this.wrapper.style.left = left + "px";
    }

    setTop(top: number) {
        this.wrapper.style.top = top + "px";
    }

    setHidden(v: boolean) {
        if (v) {
            this.wrapper.style.display = "none";
        } else {
            this.wrapper.style.removeProperty("display");
        }
    }
}

export function cellLeft(col: number, sizing: Sizing): number {
    const colOffset = sizing.contentInset.left;
    const colSpacing = sizing.spacing.interCol;
    const itemSize = sizing.itemSize;
    return colOffset + col * colSpacing + col * itemSize.width;
}

export function cellTop(row: number, sizing: Sizing): number {
    const spacing = sizing.spacing.interRow;
    const itemHeight = sizing.itemSize.height;
    const rowOffset = sizing.contentInset.top;
    return rowOffset + row * spacing + row * itemHeight;
}
