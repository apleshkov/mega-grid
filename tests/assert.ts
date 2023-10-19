export function truthy(expr: unknown, msg: string) {
    if (!expr) {
        throw new Error(msg);
    }
}

export function strictEq<T>(a: T, b: T) {
    truthy(a === b, `${a} !== ${b}`);
}