import { AdSpendingData } from "../store/dataSlice";

export interface DataRow {
  [key: string]: string | undefined;
}

/**
 * Normalizes an array of objects containing all strings
 * Cleans up data by trimming whitespace, handling empty values, and standardizing format
 */
export function normalizeStringObjects<
  T extends Record<string, string | undefined>
>(
  data: AdSpendingData[],
  options: {
    standardizeValues?: Record<string, Record<string, string>>;
  } = {}
): T[] {
  const { standardizeValues = {} } = options;

  const normal = data.map((item) => {
    const normalizedItem: Record<string, string | undefined> = {};

    Object.entries(item).forEach(([key, value]) => {
      let normalizedValue = value;

      // Skip if value is null or undefined
      if (normalizedValue === null || normalizedValue === undefined) {
        normalizedItem[key] = normalizedValue;
        return;
      }

      // Convert to string if not already
      normalizedValue = String(normalizedValue);

      // Trim whitespace
      normalizedValue = normalizedValue.trim();

      // Convert to uppercase
      normalizedValue = normalizedValue.toUpperCase();

      // Remove special characters (keep only alphanumeric, spaces, and common punctuation)
      normalizedValue = normalizedValue.replace(/[^\w\s\-\.&]/g, "");

      // Apply standardized values for specific fields
      if (standardizeValues[key] && standardizeValues[key][normalizedValue]) {
        normalizedValue = standardizeValues[key][normalizedValue];
      }

      normalizedItem[key] = normalizedValue;
    });
    return normalizedItem as T;
  });

  return normal;
}

/**
 * Predefined normalization for political ad spending data
 * Includes common standardizations for elections, topics, etc.
 */
export function normalizePoliticalAdData(
  data: AdSpendingData[]
): AdSpendingData[] {
  const standardizeValues = {
    election: {
      pres: "PRESIDENT",
      PRES: "PRESIDENT",
      president: "PRESIDENT",
      presidential: "PRESIDENT",
      "ca-41": "CA-41",
      "ak-01": "AK-01",
    },
    topic: {
      "economy & labor": "Economy & Labor",
      "climate & energy": "Climate & Energy",
      abortion: "Abortion",
      immigration: "Immigration",
      healthcare: "Healthcare",
      education: "Education",
    },
  };

  return normalizeStringObjects(data, {
    standardizeValues,
  });
}

/**
 * Removes duplicate objects from an array based on their stringified representation
 * Uses a Set to track seen items for efficient lookup
 * @param data Array of objects to deduplicate
 * @returns New array with duplicates removed
 */
export function removeDuplicates<T>(data: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of data) {
    const key = JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}
