import { parseUnits } from "ethers";

export function eX(x: number | string, scale: number) {
    return parseUnits(x.toString(), scale);
}

export function e18(x: number | string) {
    return eX(x, 18);
}
