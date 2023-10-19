export class Inset {

    constructor(
        public left = 0,
        public top = 0,
        public right = 0,
        public bottom = 0
    ) { }

    static all(v: number): Inset {
        return new Inset(v, v, v, v);
    }

    static horz(v: number): Inset {
        return new Inset(v, 0, v, 0);
    }

    static vert(v: number): Inset {
        return new Inset(0, v, 0, v);
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
