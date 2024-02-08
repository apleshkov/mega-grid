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
    get itemCount() { return this._itemCount; }

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

    newViewSize(viewSize: Size): Sizing {
        return new ItemSizing(
            viewSize,
            this.itemSize,
            this.contentInset,
            this.itemCount,
            this.spacing.interCol,
            this.minRowSpacing
        );
    }

    newContentInset(inset: Inset): Sizing {
        return new ItemSizing(
            this.viewSize,
            this.itemSize,
            inset,
            this.itemCount,
            this.spacing.interCol,
            this.minRowSpacing
        );
    }

    newItemCount(count: number): Sizing {
        return new ItemSizing(
            this.viewSize,
            this.itemSize,
            this.contentInset,
            count,
            this.spacing.interCol,
            this.minRowSpacing
        );
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
    get itemCount() { return this._itemCount; }

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

    newViewSize(viewSize: Size): Sizing {
        return new RowSizing(
            viewSize,
            this.rowCount,
            this.itemSize.width,
            this.contentInset,
            this.itemCount,
            this.spacing
        );
    }

    newContentInset(inset: Inset): Sizing {
        return new RowSizing(
            this.viewSize,
            this.rowCount,
            this.itemSize.width,
            inset,
            this.itemCount,
            this.spacing
        );
    }

    newItemCount(count: number): Sizing {
        return new RowSizing(
            this.viewSize,
            this.rowCount,
            this.itemSize.width,
            this.contentInset,
            count,
            this.spacing
        );
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
