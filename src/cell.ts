export interface Cell {
    renderTo(container: HTMLElement): void;
    update(item: number, container: HTMLElement): void;
    willReuse?(): void;
}
