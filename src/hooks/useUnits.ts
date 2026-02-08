import { useState, useCallback } from 'react';

export type WeightUnit = 'lb' | 'kg';

const STORAGE_KEY = 'sanctum-units';
const LB_TO_KG = 0.453592;

function loadUnit(): WeightUnit {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'kg' ? 'kg' : 'lb';
  } catch {
    return 'lb';
  }
}

export function convertWeight(lbs: number, unit: WeightUnit): number {
  if (unit === 'kg') {
    return Math.round(lbs * LB_TO_KG * 10) / 10;
  }
  return lbs;
}

export function formatWeight(lbs: number, unit: WeightUnit): string {
  const value = convertWeight(lbs, unit);
  return `${value} ${unit}`;
}

export function formatVolumeWithUnit(volume: number, unit: WeightUnit): string {
  const converted = convertWeight(volume, unit);
  if (converted >= 10000) {
    return `${(converted / 1000).toFixed(1)}k ${unit}`;
  }
  return `${converted.toLocaleString()} ${unit}`;
}

export function useUnits() {
  const [unit, setUnitState] = useState<WeightUnit>(loadUnit);

  const setUnit = useCallback((newUnit: WeightUnit) => {
    try {
      localStorage.setItem(STORAGE_KEY, newUnit);
    } catch {
      // silent
    }
    setUnitState(newUnit);
  }, []);

  return { unit, setUnit };
}
