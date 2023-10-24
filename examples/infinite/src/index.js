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

const users = userLoader(20);

const listEl = document.getElementById("list");
const rect = listEl.getBoundingClientRect();
const cell = document.getElementById("cell");
const grid = vert
    .grid(rect.width, rect.height)
    .cols(1, 80, 0, 2)
    .withCell(() => {
        const c = cell.content.cloneNode(true);
        const img = c.querySelector(".avatar");
        const name = c.querySelector(".name");
        return {
            renderTo(container) {
                container.appendChild(c);
            },
            update(_, item) {
                const u = users.getAt(item);
                img.src = u.picture.thumbnail;
                name.innerText = u.name.first + " " + u.name.last;
            },
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
