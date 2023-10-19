import { strictEq, truthy } from "./assert";
import { Inset, Size, Spacing } from "../src/geometry";
import * as vert from "../src/vert";
import * as horz from "../src/horz";
import { IndexRange } from "../src/scrolling";
import { Sizing } from "../src";

type TestCase = { name: string, test: () => void };

const vertCases: TestCase[] = [
    //
    // ItemSizing
    //
    {
        name: "vert.ItemSizing: 0x0 in 0x0",
        test: () => {
            const s = new vert.ItemSizing(
                new Size(0, 0),
                new Size(0, 0)
            );
            strictEq(s.contentSize.width, 0);
            strictEq(s.contentSize.height, 0);
            strictEq(s.colCount, 0);
            strictEq(s.rowCount, 0);
            strictEq(s.spacing.interCol, 0);
        }
    },
    {
        name: "vert.ItemSizing: 10x10 in 100x100",
        test: () => {
            const s = new vert.ItemSizing(
                new Size(100, 100),
                new Size(10, 10),
                new Inset(),
                10
            );
            strictEq(s.contentSize.height, 10);
            strictEq(s.colCount, 10);
            strictEq(s.rowCount, 1);
            strictEq(s.spacing.interCol, 0);
        }
    },
    {
        name: "vert.ItemSizing: setViewSize",
        test: () => {
            const s = new vert.ItemSizing(
                new Size(100, 100),
                new Size(10, 10),
                Inset.all(1),
                100,
                3
            );
            strictEq(s.colCount, 9);
            strictEq(s.rowCount, 12);
            strictEq(s.contentSize.height, 12 * 10 + 3 * 11 + (1 + 1));
            strictEq(s.spacing.interCol, 1);
            s.setViewSize(new Size(20, 11));
            strictEq(s.colCount, 1);
            strictEq(s.rowCount, 100);
            strictEq(s.contentSize.height, 100 * 10 + 99 * 3 + (1 + 1));
            strictEq(s.spacing.interCol, 0);
        }
    },
    {
        name: "vert.ItemSizing: setItemCount",
        test: () => {
            const s = new vert.ItemSizing(
                new Size(98, 142),
                new Size(10, 10),
                Inset.horz(5).vert(9),
                100,
                7
            );
            strictEq(s.colCount, 8);
            strictEq(s.rowCount, 13);
            strictEq(s.contentSize.height, 13 * 10 + 12 * 7 + (9 + 9));
            strictEq(Math.floor(s.spacing.interCol * 1000), 1142);
            s.setItemCount(10);
            strictEq(s.rowCount, 2);
            strictEq(s.contentSize.height, 2 * 10 + 1 * 7 + 18);
        }
    },
    //
    // ColSizing
    //
    {
        name: "vert.ColSizing: 0x0 in 0x0",
        test: () => {
            const s = new vert.ColSizing(
                new Size(0, 0),
                0,
                0
            );
            strictEq(s.contentSize.width, 0);
            strictEq(s.contentSize.height, 0);
            strictEq(s.itemSize.width, 0);
            strictEq(s.rowCount, 0);
        }
    },
    {
        name: "vert.ColSizing: 10x10 in 100x100",
        test: () => {
            const s = new vert.ColSizing(
                new Size(100, 100),
                10,
                10,
                new Inset(),
                10
            );
            strictEq(s.contentSize.height, 10);
            strictEq(s.itemSize.width, 10);
            strictEq(s.rowCount, 1);
        }
    },
    {
        name: "vert.ColSizing: setViewSize",
        test: () => {
            const s = new vert.ColSizing(
                new Size(100, 100),
                10,
                10,
                Inset.all(1),
                100,
                new Spacing(1, 3)
            );
            strictEq(s.itemSize.width, (100 - (1 + 1) - 1 * 9) / 10);
            strictEq(s.rowCount, 10);
            strictEq(s.contentSize.height, 10 * 10 + 9 * 3 + (1 + 1));
            strictEq(s.spacing.interCol, 1);
            s.setViewSize(new Size(20, 11));
            strictEq(s.itemSize.width, (20 - (1 + 1) - 1 * 9) / 10);
            strictEq(s.rowCount, 10);
            strictEq(s.contentSize.height, 10 * 10 + 9 * 3 + (1 + 1));
        }
    },
    {
        name: "vert.ColSizing: setItemCount",
        test: () => {
            const s = new vert.ColSizing(
                new Size(98, 142),
                10,
                10,
                Inset.horz(5).vert(9),
                100,
                new Spacing(3, 7)
            );
            strictEq(s.itemSize.width, (98 - (5 + 5) - 3 * 9) / 10);
            strictEq(s.rowCount, 10);
            strictEq(s.contentSize.height, 10 * 10 + 9 * 7 + (9 + 9));
            s.setItemCount(10);
            strictEq(s.rowCount, 1);
            strictEq(s.contentSize.height, 1 * 10 + 18);
        }
    },
    //
    // Scroller
    //
    {
        name: "vert.Scroller: ItemSizing, no overscan",
        test: () => {
            const sizing = new vert.ItemSizing(
                new Size(23, 33),
                new Size(10, 10),
                Inset.all(1),
                20,
                1
            );
            strictEq(sizing.colCount, 2);
            strictEq(sizing.rowCount, 10);
            strictEq(sizing.contentSize.height, 10 * 10 + 9 * 1 + (1 + 1));
            const cells = new TestCells(sizing, "vert");
            const scroller = new vert.Scroller(
                sizing,
                0,
                cells.init.bind(cells),
                cells.enqueue.bind(cells),
                cells.dequeue.bind(cells),
                0
            );
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 2))
            );
            scroller.scroll(10);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 3))
            );
            scroller.scroll(23);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(2, 4))
            );
            scroller.scroll(34);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(3, 5))
            );
            scroller.scroll(60);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(5, 8))
            );
            scroller.scroll(100);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(9, 9))
            );
            scroller.scroll(0);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 2))
            );
        }
    },
    {
        name: "vert.Scroller: ColSizing, overscan = 2",
        test: () => {
            const sizing = new vert.ColSizing(
                new Size(23, 33),
                /* overscan = */2,
                10,
                Inset.all(1),
                20,
                new Spacing(1, 1)
            );
            strictEq(sizing.itemSize.width, (23 - (1 + 1) - 1 * 1) / 2);
            strictEq(sizing.rowCount, 10);
            strictEq(sizing.contentSize.height, 10 * 10 + 9 * 1 + (1 + 1));
            const cells = new TestCells(sizing, "vert");
            const scroller = new vert.Scroller(
                sizing,
                2,
                cells.init.bind(cells),
                cells.enqueue.bind(cells),
                cells.dequeue.bind(cells),
                0
            );
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 2 + 2))
            );
            scroller.scroll(10);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 3 + 2))
            );
            scroller.scroll(23);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(2 - 2, 4 + 2))
            );
            scroller.scroll(34);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(3 - 2, 5 + 2))
            );
            scroller.scroll(60);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(5 - 2, 7 + 2))
            );
            scroller.scroll(100);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(9 - 2, 9))
            );
            scroller.scroll(0);
            TestCells.assertMap(
                cells.map,
                TestCells.vertMap(sizing, new IndexRange(0, 2 + 2))
            );
        }
    }
];

const horzCases: TestCase[] = [
    //
    // ItemSizing
    //
    {
        name: "horz.ItemSizing: 0x0 in 0x0",
        test: () => {
            const s = new horz.ItemSizing(
                new Size(0, 0),
                new Size(0, 0)
            );
            strictEq(s.contentSize.width, 0);
            strictEq(s.contentSize.height, 0);
            strictEq(s.colCount, 0);
            strictEq(s.rowCount, 0);
            strictEq(s.spacing.interRow, 0);
        }
    },
    {
        name: "horz.ItemSizing: 10x10 in 100x100",
        test: () => {
            const s = new horz.ItemSizing(
                new Size(100, 100),
                new Size(10, 10),
                new Inset(),
                10
            );
            strictEq(s.contentSize.width, 10);
            strictEq(s.colCount, 1);
            strictEq(s.rowCount, 10);
            strictEq(s.spacing.interRow, 0);
        }
    },
    {
        name: "horz.ItemSizing: setViewSize",
        test: () => {
            const s = new horz.ItemSizing(
                new Size(100, 100),
                new Size(10, 10),
                Inset.all(1),
                100,
                3
            );
            strictEq(s.colCount, 12);
            strictEq(s.rowCount, 9);
            strictEq(s.contentSize.width, 12 * 10 + 3 * 11 + (1 + 1));
            strictEq(s.spacing.interRow, 1);
            s.setViewSize(new Size(20, 11));
            strictEq(s.colCount, 100);
            strictEq(s.rowCount, 1);
            strictEq(s.contentSize.width, 100 * 10 + 99 * 3 + (1 + 1));
            strictEq(s.spacing.interRow, 0);
        }
    },
    {
        name: "horz.ItemSizing: setItemCount",
        test: () => {
            const s = new horz.ItemSizing(
                new Size(142, 98),
                new Size(10, 10),
                Inset.horz(9).vert(5),
                100,
                7
            );
            strictEq(s.colCount, 13);
            strictEq(s.rowCount, 8);
            strictEq(s.contentSize.width, 13 * 10 + 12 * 7 + (9 + 9));
            strictEq(Math.floor(s.spacing.interRow * 1000), 1142);
            s.setItemCount(10);
            strictEq(s.colCount, 2);
            strictEq(s.contentSize.width, 2 * 10 + 1 * 7 + 18);
        }
    },
    //
    // ColSizing
    //
    {
        name: "horz.RowSizing: 0x0 in 0x0",
        test: () => {
            const s = new horz.RowSizing(
                new Size(0, 0),
                0,
                0
            );
            strictEq(s.contentSize.width, 0);
            strictEq(s.contentSize.height, 0);
            strictEq(s.itemSize.height, 0);
            strictEq(s.colCount, 0);
        }
    },
    {
        name: "horz.RowSizing: 10x10 in 100x100",
        test: () => {
            const s = new horz.RowSizing(
                new Size(100, 100),
                10,
                10,
                new Inset(),
                10
            );
            strictEq(s.contentSize.width, 10);
            strictEq(s.itemSize.height, 10);
            strictEq(s.colCount, 1);
        }
    },
    {
        name: "horz.RowSizing: setViewSize",
        test: () => {
            const s = new horz.RowSizing(
                new Size(100, 100),
                10,
                10,
                Inset.all(1),
                100,
                new Spacing(3, 1)
            );
            strictEq(s.itemSize.height, (100 - (1 + 1) - 1 * 9) / 10);
            strictEq(s.colCount, 10);
            strictEq(s.contentSize.width, 10 * 10 + 9 * 3 + (1 + 1));
            strictEq(s.spacing.interRow, 1);
            s.setViewSize(new Size(11, 20));
            strictEq(s.itemSize.height, (20 - (1 + 1) - 1 * 9) / 10);
            strictEq(s.colCount, 10);
            strictEq(s.contentSize.width, 10 * 10 + 9 * 3 + (1 + 1));
        }
    },
    {
        name: "horz.RowSizing: setItemCount",
        test: () => {
            const s = new horz.RowSizing(
                new Size(142, 98),
                10,
                10,
                Inset.horz(9).vert(5),
                100,
                new Spacing(7, 3)
            );
            strictEq(s.itemSize.height, (98 - (5 + 5) - 3 * 9) / 10);
            strictEq(s.colCount, 10);
            strictEq(s.contentSize.width, 10 * 10 + 9 * 7 + (9 + 9));
            s.setItemCount(10);
            strictEq(s.colCount, 1);
            strictEq(s.contentSize.width, 1 * 10 + 18);
        }
    },
    //
    // Scroller
    //
    {
        name: "horz.Scroller: ItemSizing, no overscan",
        test: () => {
            const sizing = new horz.ItemSizing(
                new Size(33, 23),
                new Size(10, 10),
                Inset.all(1),
                20,
                1
            );
            strictEq(sizing.rowCount, 2);
            strictEq(sizing.colCount, 10);
            strictEq(sizing.contentSize.width, 10 * 10 + 9 * 1 + (1 + 1));
            const cells = new TestCells(sizing, "horz");
            const scroller = new horz.Scroller(
                sizing,
                0,
                cells.init.bind(cells),
                cells.enqueue.bind(cells),
                cells.dequeue.bind(cells),
                0
            );
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 2))
            );
            scroller.scroll(10);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 3))
            );
            scroller.scroll(23);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(2, 4))
            );
            scroller.scroll(34);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(3, 5))
            );
            scroller.scroll(60);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(5, 8))
            );
            scroller.scroll(100);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(9, 9))
            );
            scroller.scroll(0);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 2))
            );
        }
    },
    {
        name: "horz.Scroller: ColSizing, overscan = 2",
        test: () => {
            const sizing = new horz.RowSizing(
                new Size(33, 23),
                /* overscan = */2,
                10,
                Inset.all(1),
                20,
                new Spacing(1, 1)
            );
            strictEq(sizing.itemSize.height, (23 - (1 + 1) - 1 * 1) / 2);
            strictEq(sizing.colCount, 10);
            strictEq(sizing.contentSize.width, 10 * 10 + 9 * 1 + (1 + 1));
            const cells = new TestCells(sizing, "horz");
            const scroller = new horz.Scroller(
                sizing,
                2,
                cells.init.bind(cells),
                cells.enqueue.bind(cells),
                cells.dequeue.bind(cells),
                0
            );
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 2 + 2))
            );
            scroller.scroll(10);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 3 + 2))
            );
            scroller.scroll(23);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(2 - 2, 4 + 2))
            );
            scroller.scroll(34);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(3 - 2, 5 + 2))
            );
            scroller.scroll(60);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(5 - 2, 7 + 2))
            );
            scroller.scroll(100);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(9 - 2, 9))
            );
            scroller.scroll(0);
            TestCells.assertMap(
                cells.map,
                TestCells.horzMap(sizing, new IndexRange(0, 2 + 2))
            );
        }
    }
];

class TestCells {

    sizing: Sizing;
    isVertical: boolean
    queue: string[][] = [];
    map: Map<number, string[]> = new Map();

    constructor(sizing: Sizing, dir: "vert" | "horz") {
        this.sizing = sizing;
        this.isVertical = (dir === "vert");
    }

    init(klen: number) {
        const vlen = this.isVertical ? this.sizing.colCount : this.sizing.rowCount;
        this.queue = Array.from({ length: klen }, () => (
            Array.from({ length: vlen }, (_, i) => String(i))
        ));
    }

    enqueue(k: number) {
        const cells = this.map.get(k);
        if (cells) {
            this.queue.push(cells);
            this.map.delete(k);
        }
    }

    dequeue(k: number) {
        if (!this.map.has(k)) {
            const cells = this.queue.pop()!;
            this.map.set(k, cells);
        }
    }

    static vertMap(sz: Sizing, r: IndexRange): Map<number, string[]> {
        const map = new Map();
        for (let row = r.start; row <= r.end; row += 1) {
            const cells = Array.from({ length: sz.colCount }, (_, col) => (
                String(col)
            ));
            map.set(row, cells);
        }
        return map;
    }

    static horzMap(sz: Sizing, r: IndexRange): Map<number, string[]> {
        const map = new Map();
        for (let col = r.start; col <= r.end; col += 1) {
            const cells = Array.from({ length: sz.rowCount }, (_, row) => (
                String(row)
            ));
            map.set(col, cells);
        }
        return map;
    }

    static mapToString(map: Map<number, string[]>): string {
        return Array.from(map.keys())
            .sort((a, b) => a - b)
            .map((k) => (
                `[${k}] => [${map.get(k)!.join(", ")}]`
            ))
            .join("\n");
    }

    static assertMap(actual: Map<number, string[]>, expected: Map<number, string[]>) {
        const a = this.mapToString(actual);
        const b = this.mapToString(expected);
        truthy(a === b, `\nactual:\n${a}\n\nexpected:\n${b}\n`);
    }
}

const cases: TestCase[] = vertCases.concat(horzCases);
let html = `<p>Running ${cases.length} tests...</p>`;
const errors: string[] = [];
cases.forEach((c) => {
    try {
        c.test();
    } catch (e) {
        errors.push(`<p>Test "<strong>${c.name}</strong>" failed: <code>${e}</code><p>`);
        console.error(e);
    }
});
if (errors.length > 0) {
    html += `<h1>Failed!</h1>${errors.join("")}`;
} else {
    html += "<h1>OK!</h1>";
}
document.getElementById("app")!.innerHTML = html;
