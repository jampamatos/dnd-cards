export type PageFormat = "A4" | "Letter" | "A3";
export type Orientation = "portrait" | "landscape";
export type Density = "S" | "M" | "L";

export function pageRule(format: PageFormat, orientation: Orientation, marginMn = 10) {
    return `@page { size: ${format} ${orientation}; margin: ${marginMn}mm; }`;
}

/** columns per format/orientation/density (initial tuning) */
export function columns(format: PageFormat, orientation: Orientation, density: Density) {
    const base =
        format === "A3" ?       (orientation === "portrait" ? {S:6,M:5,L:4} : {S:7,M:6,L:5}) :
        format === "Letter" ?   (orientation === "portrait" ? {S:4,M:3,L:2} : {S:5,M:4,L:3}) :
        /* A4 */                (orientation === "portrait" ? {S:4,M:3,L:2} : {S:5,M:4,L:3});
    return base[density];
}