import { Cell } from "./cell";
import { Point, Size } from "./geometry";

export interface Griding<C extends Cell> {

    setViewSize(viewSize: Size): void;
    setItemCount(count: number): void;

    addContentOverlay<T extends Node>(overlay: T): T;
    refresh(): void;

    insertTo(target: Node, beforeNode: Node | null): void;
    remove(): void;
    disconnect(): void;

    scrollToEnd(animated: boolean): void;
    scrollBy(offset: number, animated: boolean): void;
    scrollTo(position: number, animated: boolean): void;

    originOfItem(item: number): Point;
    isVisibleItem(item: number): boolean;
    forEachVisibleCell(fn: (cell: C, col: number, row: number) => void): void;
}
