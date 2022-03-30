const { pow } = Math;

export function easeOutCubic(x: number): number {
    return 1 - pow(1 - x, 3);
}

export function easeOutQuint(x: number): number {
    return 1 - pow(1 - x, 5);
}