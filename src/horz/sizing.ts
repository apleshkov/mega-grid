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

    private readonly minRowSpacing;

    private _colCount: number;
    get colCount() { return this._colCount; }

    private _rowCount: number;
    get rowCount() { return this._rowCount; }

    constructor(
        viewSize: Size,
        itemSize: Size,
        contentInset = new Inset(),
        itemCount = 0,
        colSpacing = 0,
        minRowSpacing = 0
    ) {
        this._viewSize = viewSize;
        this.itemSize = itemSize;
        this._contentInset = contentInset;
        this._itemCount = itemCount;
        const contentHeight = viewSize.height;
        const rows = rowCount(itemSize.height, contentHeight, contentInset, minRowSpacing);
        this._rowCount = rows;
        const cols = colCount(rows, itemCount);
        this._colCount = cols;
        this._spacing.interCol = colSpacing;
        this._spacing.interRow = Math.max(
            minRowSpacing,
            rowSpacing(itemSize.height, contentHeight, contentInset, rows)
        );
        this.minRowSpacing = minRowSpacing;
        this._contentSize = new Size(
            contentWidth(itemSize.width, colSpacing, cols, contentInset),
            contentHeight
        );
    }

    setViewSize(viewSize: Size) {
        if (this.viewSize.equals(viewSize)) {
            return false;
        }
        this._viewSize = viewSize;
        const itemCount = this._itemCount;
        const contentHeight = viewSize.height;
        const itemHeight = this.itemSize.height;
        const contentInset = this._contentInset;
        const rows = rowCount(itemHeight, contentHeight, contentInset, this.minRowSpacing);
        const cols = colCount(rows, itemCount);
        this._colCount = cols;
        this._rowCount = rows;
        this._spacing.interRow = Math.max(
            this.minRowSpacing,
            rowSpacing(itemHeight, contentHeight, contentInset, rows)
        );
        this._contentSize = new Size(
            contentWidth(this.itemSize.width, this._spacing.interCol, cols, contentInset),
            contentHeight
        );
        return true;
    }

    setItemCount(count: number) {
        if (this._itemCount === count) {
            return false;
        }
        this._itemCount = count;
        this._colCount = colCount(this._rowCount, count);
        this._contentSize.width = contentWidth(
            this.itemSize.width,
            this._spacing.interCol,
            this._colCount,
            this._contentInset
        );
        return true;
    }
}

export class RowSizing implements Sizing {

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

    private _colCount: number;
    get colCount() { return this._colCount; }

    readonly rowCount: number;

    constructor(
        viewSize: Size,
        rowCount: number,
        itemWidth: number,
        contentInset = new Inset(),
        itemCount = 0,
        spacing = new Spacing(),
    ) {
        this._viewSize = viewSize;
        const contentHeight = viewSize.height;
        this._itemSize = new Size(
            itemWidth,
            itemHeight(contentHeight, contentInset, rowCount, spacing.interRow)
        );
        this._contentInset = contentInset;
        this._itemCount = itemCount;
        this.spacing = spacing;
        this.rowCount = rowCount;
        const cols = colCount(rowCount, itemCount);
        this._colCount = cols;
        this._contentSize = new Size(
            contentWidth(itemWidth, spacing.interCol, cols, contentInset),
            contentHeight
        );
    }

    setViewSize(viewSize: Size) {
        if (this.viewSize.equals(viewSize)) {
            return false;
        }
        this._viewSize = viewSize;
        const itemCount = this._itemCount;
        const contentHeight = viewSize.height;
        const contentInset = this._contentInset;
        const rows = this.rowCount;
        const cols = colCount(rows, itemCount);
        this._colCount = cols;
        this._itemSize.height = itemHeight(contentHeight, contentInset, rows, this.spacing.interRow);
        this._contentSize = new Size(
            contentWidth(this.itemSize.width, this.spacing.interCol, cols, contentInset),
            contentHeight
        );
        return true;
    }

    setItemCount(count: number) {
        if (this._itemCount === count) {
            return false;
        }
        this._itemCount = count;
        this._colCount = colCount(this.rowCount, count);
        this._contentSize.width = contentWidth(
            this.itemSize.width,
            this.spacing.interCol,
            this._colCount,
            this._contentInset
        );
        return true;
    }
}

function rowCount(
    itemHeight: number,
    contentHeight: number,
    contentInset: Inset,
    minRowSpacing: number
): number {
    if (itemHeight === 0) {
        return 0;
    } else {
        const h = contentInset.insetHeight(contentHeight);
        const c = Math.floor(
            (h + minRowSpacing) / (itemHeight + minRowSpacing)
        );
        return Math.max(1, c);
    }
}

function rowSpacing(
    itemHeight: number,
    contentHeight: number,
    contentInset: Inset,
    rows: number
): number {
    if (rows > 1) {
        const w = contentInset.insetHeight(contentHeight);
        const v = (w - rows * itemHeight) / (rows - 1);
        return v;
    } else {
        return 0;
    }
}

function itemHeight(
    contentHeight: number,
    contentInset: Inset,
    rowCount: number,
    rowSpacing: number
): number {
    if (rowCount === 0) {
        return 0;
    }
    let w = contentInset.insetHeight(contentHeight);
    w -= (rowCount - 1) * rowSpacing;
    return w / rowCount;
}

function colCount(rows: number, itemCount: number): number {
    return rows > 0 ? Math.ceil(itemCount / rows) : 0;
}

function contentWidth(
    itemWidth: number,
    colSpacing: number,
    colCount: number,
    contentInset: Inset
): number {
    const w = itemWidth * colCount + colSpacing * (colCount - 1);
    return contentInset.left + w + contentInset.right;
}
