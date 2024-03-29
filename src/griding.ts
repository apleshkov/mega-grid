import { Cell } from "./cell";
import { Inset, Point } from "./geometry";

export interface Griding<C extends Cell> {

    setViewSize(width: number, height: number): void;
    setContentInset(inset: Inset): void;

    setItemCount(count: number): void;

    addContentOverlay<T extends Node>(overlay: T): T;
    refresh(): void;

    insertTo(target: Node, beforeNode: Node | null): void;
    remove(): void;
    unmount(removing: boolean): void;

    onScroll(
        cb: () => void,
        options?: {
            once?: boolean
            signal?: AbortSignal
        }
    ): void;
    scrollToEnd(animated: boolean): void;
    scrollBy(offset: number, animated: boolean): void;
    scrollTo(position: number, animated: boolean): void;

    originOfItem(item: number): Point;
    isVisibleItem(item: number): boolean;
    forEachVisibleCell(fn: (cell: C, col: number, row: number) => void): void;
}
