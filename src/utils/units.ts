export type UnitSystem = 'metric' | 'imperial';

/**
 * Converts kg to lbs.
 */
export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

/**
 * Converts lbs to kg.
 */
export const lbsToKg = (lbs: number): number => {
  return Math.round((lbs / 2.20462) * 10) / 10;
};

/**
 * Format weight based on unit system.
 * e.g. 90 kg -> "90 kg" or "198 lbs"
 */
export const formatWeight = (kg: number, unitSystem: UnitSystem, includeUnit = true): string => {
  if (unitSystem === 'imperial') {
    const lbs = Math.round(kg * 2.20462);
    return includeUnit ? `${lbs} lbs` : `${lbs}`;
  }
  return includeUnit ? `${kg} kg` : `${kg}`;
};

/**
 * Convert cm to feet and inches.
 * e.g. 180 cm -> { feet: 5, inches: 11, label: "5'11\"" }
 */
export const cmToFeetInches = (cm: number): { feet: number; inches: number; label: string } => {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches, label: `${feet}'${inches}"` };
};

/**
 * Format height based on unit system.
 * e.g. 180 cm -> "180 cm" or "5'11\""
 */
export const formatHeight = (cm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    return cmToFeetInches(cm).label;
  }
  return `${cm} cm`;
};

/**
 * Convert ml to fluid ounces.
 * 1 ml ≈ 0.033814 fl oz.
 */
export const mlToFlOz = (ml: number): number => {
  return Math.round(ml * 0.033814);
};

/**
 * Format water intake based on unit system.
 * e.g. 2500 ml -> "2,500 ml" or "85 fl oz"
 */
export const formatWater = (ml: number, unitSystem: UnitSystem, includeUnit = true): string => {
  if (unitSystem === 'imperial') {
    const flOz = mlToFlOz(ml);
    return includeUnit ? `${flOz} fl oz` : `${flOz}`;
  }
  return includeUnit ? `${ml.toLocaleString()} ml` : `${ml.toLocaleString()}`;
};

/**
 * Format body measurements (chest, waist, etc.) in cm or inches.
 */
export const formatMeasurement = (cm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    const inches = (cm / 2.54).toFixed(1);
    return `${inches} in`;
  }
  return `${cm} cm`;
};
