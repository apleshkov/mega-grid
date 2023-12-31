import { Inset, Size, Spacing } from "./geometry";

export interface SizeInfo {
    readonly viewSize: Size;
    readonly contentSize: Size;
    readonly contentInset: Inset;
    readonly itemSize: Size;
    readonly spacing: Spacing;
    readonly colCount: number;
    readonly rowCount: number;
}

export interface Sizing extends SizeInfo {
    setViewSize(viewSize: Size): boolean;
    setItemCount(count: number): boolean;
}