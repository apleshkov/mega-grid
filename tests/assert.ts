import { Size } from "../src/geometry";

export function truthy(expr: unknown, msg: string) {
    if (!expr) {
        throw new Error(msg);
    }
}

export function strictEq<T>(a: T, b: T) {
    truthy(a === b, `${a} !== ${b}`);
}

export function eqSizes(a: Size, b: Size) {
    truthy(
        a.equals(b),
        `${a.width}x${a.height} !== ${b.width}x${b.height}`
    );
}