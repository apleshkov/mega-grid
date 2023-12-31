import { vert } from "mega-grid";

function userLoader(limit) {
    let isLoading = false;
    let data = [];
    let page = 1;
    let seed;
    return {
        get length() {
            return data.length;
        },
        getAt(idx) {
            return data[idx];
        },
        onLoad: null,
        load() {
            if (isLoading) {
                return;
            }
            isLoading = true;
            let url = `https://randomuser.me/api/?page=${page}&results=${limit}`;
            if (seed) {
                url += `&seed=${seed}`;
            }
            fetch(url, { mode: "cors" })
                .then((r) => r.json())
                .then(({ results, info }) => {
                    data.push(...results);
                    if (!seed && page === 1) {
                        seed = info.seed;
                    }
                    page += 1;
                    this.onLoad?.();
                })
                .finally(() => (isLoading = false));
        }
    };
}

const users = userLoader(30);

const listEl = document.getElementById("list");
const rect = listEl.getBoundingClientRect();
const cell = document.getElementById("cell");
const grid = vert
    .grid(rect.width, rect.height)
    .cols({ count: 2, itemHeight: 80, colSpacing: 10, rowSpacing: 10 })
    .contentInset(10)
    .withCell(() => {
        const c = cell.content.cloneNode(true);
        const img = c.querySelector(".avatar");
        const name = c.querySelector(".name");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(item) {
                const u = users.getAt(item);
                img.src = u.picture.thumbnail;
                name.innerText = u.name.first + " " + u.name.last;
            },
            willReuse() {
                img.src = "";
            }
        };
    })
    .insertTo(listEl);

users.onLoad = () => {
    grid.setItemCount(users.length);
};
users.load();

grid.onScroll(() => {
    const top = grid.scrollTop;
    const contentHeight = grid.sizeInfo.contentSize.height;
    const viewHeight = grid.sizeInfo.viewSize.height;
    if (contentHeight - (top + viewHeight) < viewHeight) {
        users.load();
    }
});
