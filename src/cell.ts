export interface Cell {
    renderTo(container: HTMLElement): void;
    update(container: HTMLElement, item: number): void;
    willReuse?(): void;
}
