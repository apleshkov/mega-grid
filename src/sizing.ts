import { Inset, Size, Spacing } from "./geometry";

export interface SizeInfo {
    readonly viewSize: Size;
    readonly contentSize: Size;
    readonly contentInset: Inset;
    readonly itemSize: Size;
    readonly itemCount: number;
    readonly spacing: Spacing;
    readonly colCount: number;
    readonly rowCount: number;
}

export interface Sizing extends SizeInfo {
    newViewSize(viewSize: Size): Sizing;
    newContentInset(inset: Inset): Sizing;
    newItemCount(count: number): Sizing;
}