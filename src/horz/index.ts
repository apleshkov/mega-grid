import { Cell } from "../cell";
import { Inset, Size, Spacing } from "../geometry";
import { Sizing } from "../sizing";
import { Grid } from "./grid";
import { RowSizing, ItemSizing } from "./sizing";

export type GridBuilder = {
    itemSize(params: {
        width: number,
        height: number,
        colSpacing?: number,
        minRowSpacing?: number
    }): GridBuilder;
    rows(params: {
        count: number,
        itemWidth: number,
        colSpacing?: number,
        rowSpacing?: number
    }): GridBuilder;

    contentInset(inset: number | { top?: number, right?: number, bottom?: number, left?: number } | Inset): GridBuilder;
    itemCount(v: number): GridBuilder;

    withCell(fn: () => Cell): GridBuilder;
    overscan(v: number): GridBuilder;

    className(name: string): GridBuilder;

    build(): Grid;
    insertTo(target: Node, beforeNode?: Node | null): Grid;
};

export function grid(viewWidth: number, viewHeight: number): GridBuilder {
    const viewSize = new Size(viewWidth, viewHeight);
    let contentInset: Inset | undefined;
    let itemCount: number | undefined;
    let buildSizing: (() => Sizing) | undefined;
    let createCell: (() => Cell) | undefined;
    let overscan = 2;
    let className: string | undefined;
    return {
        itemSize({ width, height, colSpacing, minRowSpacing }) {
            buildSizing = () => new ItemSizing(
                viewSize,
                new Size(width, height),
                contentInset,
                itemCount,
                colSpacing,
                minRowSpacing
            );
            return this;
        },
        rows({ count, itemWidth, colSpacing, rowSpacing }) {
            buildSizing = () => new RowSizing(
                viewSize,
                count,
                itemWidth,
                contentInset,
                itemCount,
                new Spacing(colSpacing, rowSpacing)
            );
            return this;
        },
        withCell(fn) {
            createCell = fn;
            return this;
        },
        contentInset(inset) {
            if (typeof inset === "number") {
                contentInset = Inset.all(inset);
            } else if (inset instanceof Inset) {
                contentInset = inset;
            } else {
                contentInset = new Inset(inset);
            }
            return this;
        },
        itemCount(v) {
            itemCount = v;
            return this;
        },
        overscan(v) {
            overscan = v;
            return this;
        },
        className(name) {
            className = name;
            return this;
        },
        build() {
            if (!buildSizing) {
                throw new Error("Unable to build: no item size information, use `itemSize()` or `cols()`");
            }
            if (!createCell) {
                throw new Error("Unable to build: no cell creator, use `withCell()`");
            }
            return new Grid(
                buildSizing(),
                createCell,
                overscan,
                className
            );
        },
        insertTo(target, beforeNode) {
            const g = this.build();
            g.insertTo(target, beforeNode);
            return g;
        },
    };
}

export * from "./sizing";
export * from "./scroller";
export * from "./grid";
