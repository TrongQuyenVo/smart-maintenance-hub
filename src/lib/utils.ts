import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Human-friendly Vietnamese labels for asset types
export const assetTypeLabels: Record<string, string> = {
  AHU: 'AHU', // Air Handling Unit
  FCU: 'FCU', // Fan Coil Unit
  Chiller: 'Máy làm lạnh',
  Pump: 'Bơm',
  Compressor: 'Máy nén',
  Motor: 'Động cơ',
};

export function getAssetTypeLabel(type: string) {
  return assetTypeLabels[type] || type;
}
