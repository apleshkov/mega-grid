export class Inset {

    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(
        values?: {
            top?: number,
            right?: number,
            bottom?: number,
            left?: number
        }
    ) {
        this.top = values?.top ?? 0;
        this.right = values?.right ?? 0;
        this.bottom = values?.bottom ?? 0;
        this.left = values?.left ?? 0;
    }

    static all(value: number): Inset {
        return new Inset({
            top: value, right: value, bottom: value, left: value
        });
    }

    static horz(value: number): Inset {
        return new Inset({ left: value, right: value });
    }

    static vert(value: number): Inset {
        return new Inset({ top: value, bottom: value });
    }

    horz(v: number): Inset {
        this.left = v;
        this.right = v;
        return this;
    }

    vert(v: number): Inset {
        this.top = v;
        this.bottom = v;
        return this;
    }

    insetWidth(width: number): number {
        return width - (this.left + this.right);
    }

    insetHeight(height: number): number {
        return height - (this.top + this.bottom);
    }
}

export class Size {

    constructor(
        public width: number,
        public height: number
    ) { }

    equals(other: Size): boolean {
        return this.width === other.width
            && this.height === other.height;
    }
}

export class Point {

    constructor(
        public x: number,
        public y: number
    ) { }
}

export class Spacing {

    constructor(
        public interCol = 0,
        public interRow = 0
    ) { }
}
