import { loadCapacityTable } from "./data";

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return "0.00";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function roundToBeautifulPrice(num: number): number {
  if (num <= 0) return 0;
  return Math.ceil(num / 5) * 5;
}

export function getLoadCapacity(length: number, wireCount: string): number {
  const lengthKeys = Object.keys(loadCapacityTable).map(Number).sort((a, b) => a - b);
  const wireIndexMap: Record<string, number> = { "4": 0, "5": 1, "6": 2, "7": 3, "8": 4 };

  let effectiveWireCount = wireCount;
  let index = wireIndexMap[effectiveWireCount] !== undefined
    ? wireIndexMap[effectiveWireCount]
    : (parseInt(effectiveWireCount) > 8 || effectiveWireCount === "5_mm_5" ? 4 : 0);

  if (index > 4) index = 4;

  let closestLengthKey = lengthKeys.find((key) => key >= length);

  if (!closestLengthKey) {
    closestLengthKey = lengthKeys[lengthKeys.length - 1];
  } else if (length < lengthKeys[0]) {
    closestLengthKey = lengthKeys[0];
  }

  const capacityArray = loadCapacityTable[closestLengthKey];

  if (capacityArray && capacityArray[index] !== undefined) {
    return capacityArray[index];
  }

  return 0;
}
