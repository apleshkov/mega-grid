import { Size, Inset, Spacing } from "../geometry";
import { Sizing } from "../sizing";

export class ItemSizing implements Sizing {

    private _viewSize: Size;
    get viewSize() { return this._viewSize; }

    readonly itemSize: Size;

    private _contentInset: Inset;
    get contentInset() { return this._contentInset; }

    private _contentSize: Size;
    get contentSize() { return this._contentSize; }

    private _itemCount: number;

    private _spacing = new Spacing();
    get spacing() { return this._spacing; }

    private readonly minColSpacing;

    private _colCount: number;
    get colCount() { return this._colCount; }

    private _rowCount: number;
    get rowCount() { return this._rowCount; }

    constructor(
        viewSize: Size,
        itemSize: Size,
        contentInset = new Inset(),
        itemCount = 0,
        rowSpacing = 0,
        minColSpacing = 0
    ) {
        this._viewSize = viewSize;
        this.itemSize = itemSize;
        this._contentInset = contentInset;
        this._itemCount = itemCount;
        const contentWidth = viewSize.width;
        const cols = colCount(itemSize.width, contentWidth, contentInset, minColSpacing);
        this._colCount = cols;
        const rows = rowCount(cols, itemCount);
        this._rowCount = rows;
        this._spacing.interCol = Math.max(
            minColSpacing,
            colSpacing(itemSize.width, contentWidth, contentInset, cols)
        );
        this._spacing.interRow = rowSpacing;
        this.minColSpacing = minColSpacing;
        this._contentSize = new Size(
            contentWidth,
            contentHeight(itemSize.height, rowSpacing, rows, contentInset)
        );
    }

    setViewSize(viewSize: Size) {
        if (this.viewSize.equals(viewSize)) {
            return false;
        }
        this._viewSize = viewSize;
        const itemCount = this._itemCount;
        const contentWidth = viewSize.width;
        const itemWidth = this.itemSize.width;
        const contentInset = this._contentInset;
        const cols = colCount(itemWidth, contentWidth, contentInset, this.minColSpacing);
        const rows = rowCount(cols, itemCount);
        this._colCount = cols;
        this._rowCount = rows;
        this._spacing.interCol = Math.max(
            this.minColSpacing,
            colSpacing(itemWidth, contentWidth, contentInset, cols)
        );
        this._contentSize = new Size(
            contentWidth,
            contentHeight(this.itemSize.height, this._spacing.interRow, rows, contentInset)
        );
        return true;
    }

    setItemCount(count: number) {
        if (this._itemCount === count) {
            return false;
        }
        this._itemCount = count;
        this._rowCount = rowCount(this._colCount, count);
        this._contentSize.height = contentHeight(
            this.itemSize.height,
            this._spacing.interRow,
            this._rowCount,
            this._contentInset
        );
        return true;
    }
}

export class ColSizing implements Sizing {

    private _viewSize: Size;
    get viewSize() { return this._viewSize; }

    private _itemSize: Size;
    get itemSize() { return this._itemSize; }

    private _contentInset: Inset;
    get contentInset() { return this._contentInset; }

    private _contentSize: Size;
    get contentSize() { return this._contentSize; }

    private _itemCount: number;

    readonly spacing: Spacing;

    readonly colCount: number;

    private _rowCount: number;
    get rowCount() { return this._rowCount; }

    constructor(
        viewSize: Size,
        colCount: number,
        itemHeight: number,
        contentInset = new Inset(),
        itemCount = 0,
        spacing = new Spacing(),
    ) {
        this._viewSize = viewSize;
        const contentWidth = viewSize.width;
        this._itemSize = new Size(
            itemWidth(contentWidth, contentInset, colCount, spacing.interCol),
            itemHeight
        );
        this._contentInset = contentInset;
        this._itemCount = itemCount;
        this.spacing = spacing;
        this.colCount = colCount;
        const rows = rowCount(colCount, itemCount);
        this._rowCount = rows;
        this._contentSize = new Size(
            contentWidth,
            contentHeight(itemHeight, spacing.interRow, rows, contentInset)
        );
    }

    setViewSize(viewSize: Size) {
        if (this.viewSize.equals(viewSize)) {
            return false;
        }
        this._viewSize = viewSize;
        const itemCount = this._itemCount;
        const contentWidth = viewSize.width;
        const contentInset = this._contentInset;
        const cols = this.colCount;
        const rows = rowCount(cols, itemCount);
        this._rowCount = rows;
        this._itemSize.width = itemWidth(contentWidth, contentInset, cols, this.spacing.interCol);
        this._contentSize = new Size(
            contentWidth,
            contentHeight(this.itemSize.height, this.spacing.interRow, rows, contentInset)
        );
        return true;
    }

    setItemCount(count: number) {
        if (this._itemCount === count) {
            return false;
        }
        this._itemCount = count;
        this._rowCount = rowCount(this.colCount, count);
        this._contentSize.height = contentHeight(
            this.itemSize.height,
            this.spacing.interRow,
            this._rowCount,
            this._contentInset
        );
        return true;
    }
}

function colCount(
    itemWidth: number,
    contentWidth: number,
    contentInset: Inset,
    minColSpacing: number
): number {
    if (itemWidth === 0) {
        return 0;
    } else {
        const w = contentInset.insetWidth(contentWidth);
        const c = Math.floor(
            (w + minColSpacing) / (itemWidth + minColSpacing)
        );
        return Math.max(1, c);
    }
}

function colSpacing(
    itemWidth: number,
    contentWidth: number,
    contentInset: Inset,
    cols: number
): number {
    if (cols > 1) {
        const w = contentInset.insetWidth(contentWidth);
        const v = (w - cols * itemWidth) / (cols - 1);
        return v;
    } else {
        return 0;
    }
}

function itemWidth(
    contentWidth: number,
    contentInset: Inset,
    colCount: number,
    colSpacing: number
): number {
    if (colCount === 0) {
        return 0;
    }
    let w = contentInset.insetWidth(contentWidth);
    w -= (colCount - 1) * colSpacing;
    return w / colCount;
}

function rowCount(cols: number, itemCount: number): number {
    return cols > 0 ? Math.ceil(itemCount / cols) : 0;
}

function contentHeight(
    itemHeight: number,
    rowSpacing: number,
    rowCount: number,
    contentInset: Inset
): number {
    const h = itemHeight * rowCount + rowSpacing * (rowCount - 1);
    return contentInset.top + h + contentInset.bottom;
}
