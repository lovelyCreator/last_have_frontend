import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const DEV = false;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
