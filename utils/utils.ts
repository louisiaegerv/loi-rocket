import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numToCurrency = (num: number) => {
  const formattedNum = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return formattedNum;
};

export function floorTo500(value: number): number {
  return Math.floor(value / 500) * 500;
}
