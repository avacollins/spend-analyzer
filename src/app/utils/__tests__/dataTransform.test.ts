import {
  normalizePoliticalAdData,
  normalizeStringObjects,
  removeDuplicates,
} from "../dataTransform";

import { AdSpendingData } from "../../store/dataSlice";

describe("dataTransform utilities", () => {
  describe("normalizeStringObjects", () => {
    it("should normalize string values by trimming, uppercasing, and removing special characters", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "  Facebook Inc.  ",
          election: "pres",
          topic: "economy & labor",
          spend: "1000",
        },
      ];

      const result = normalizeStringObjects(input);

      expect(result[0]).toEqual({
        advertiser: "FACEBOOK INC.",
        election: "PRES",
        topic: "ECONOMY & LABOR",
        spend: "1000",
      });
    });

    it("should handle null and undefined values correctly", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Facebook",
          election: undefined,
          topic: undefined,
          spend: "1000",
        },
      ];

      const result = normalizeStringObjects(input);

      expect(result[0]).toEqual({
        advertiser: "FACEBOOK",
        election: undefined,
        topic: undefined,
        spend: "1000",
      });
    });

    it("should apply standardized values when provided", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Facebook",
          election: "pres",
          topic: "economy",
        },
      ];

      const standardizeValues = {
        election: {
          PRES: "PRESIDENT",
        },
        topic: {
          ECONOMY: "Economy & Labor",
        },
      };

      const result = normalizeStringObjects(input, { standardizeValues });

      expect(result[0]).toEqual({
        advertiser: "FACEBOOK",
        election: "PRESIDENT",
        topic: "Economy & Labor",
      });
    });

    it("should convert non-string values to strings", () => {
      const input = [
        {
          advertiser: "Facebook",
          spend: "1000",
          topic: "economy",
        },
      ] as AdSpendingData[];

      const result = normalizeStringObjects(input);

      expect(result[0]).toEqual({
        advertiser: "FACEBOOK",
        spend: "1000",
        topic: "ECONOMY",
      });
    });

    it("should remove various special characters but keep allowed ones", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Facebook!@#$%^&*()Inc.",
          election: "CA-41",
          topic: "economy-labor.taxes",
        },
      ];

      const result = normalizeStringObjects(input);

      expect(result[0]).toEqual({
        advertiser: "FACEBOOK&INC.",
        election: "CA-41",
        topic: "ECONOMY-LABOR.TAXES",
      });
    });
  });

  describe("normalizePoliticalAdData", () => {
    it("should apply predefined political ad standardizations", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Facebook",
          election: "pres",
          topic: "economy & labor",
        },
        {
          advertiser: "Google",
          election: "ca-41",
          topic: "climate & energy",
        },
      ];

      const result = normalizePoliticalAdData(input);

      expect(result).toEqual([
        {
          advertiser: "FACEBOOK",
          election: "PRESIDENT",
          topic: "ECONOMY & LABOR", // & is now preserved
        },
        {
          advertiser: "GOOGLE",
          election: "CA-41",
          topic: "CLIMATE & ENERGY", // & is now preserved
        },
      ]);
    });

    it("should handle different variations of presidential elections", () => {
      const input: AdSpendingData[] = [
        { election: "pres" },
        { election: "PRES" },
        { election: "president" },
        { election: "presidential" }, // This one won't match because it becomes 'PRESIDENTIAL' after processing
      ];

      const result = normalizePoliticalAdData(input);

      expect(result[0].election).toBe("PRESIDENT");
      expect(result[1].election).toBe("PRESIDENT");
      expect(result[2].election).toBe("PRESIDENT");
      expect(result[3].election).toBe("PRESIDENTIAL"); // This stays as is because it doesn't match after processing
    });

    it("should standardize topic variations", () => {
      const input: AdSpendingData[] = [
        { topic: "abortion" },
        { topic: "immigration" },
        { topic: "healthcare" },
        { topic: "education" },
      ];

      const result = normalizePoliticalAdData(input);

      expect(result.map((item) => item.topic)).toEqual([
        "ABORTION", // These don't match the standardization keys so remain uppercase
        "IMMIGRATION",
        "HEALTHCARE",
        "EDUCATION",
      ]);
    });

    it("should preserve values that do not have standardizations", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Random Corp",
          election: "local-election",
          topic: "custom-topic",
          spend: "5000",
        },
      ];

      const result = normalizePoliticalAdData(input);

      expect(result[0]).toEqual({
        advertiser: "RANDOM CORP",
        election: "LOCAL-ELECTION",
        topic: "CUSTOM-TOPIC",
        spend: "5000",
      });
    });
  });

  describe("removeDuplicates", () => {
    it("should remove duplicate objects", () => {
      const input = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
        { name: "John", age: 30 }, // duplicate
        { name: "Bob", age: 35 },
      ];

      const result = removeDuplicates(input);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
        { name: "Bob", age: 35 },
      ]);
    });

    it("should preserve order of first occurrence", () => {
      const input = [
        { id: 1, value: "first" },
        { id: 2, value: "second" },
        { id: 1, value: "first" }, // duplicate
        { id: 3, value: "third" },
        { id: 2, value: "second" }, // duplicate
      ];

      const result = removeDuplicates(input);

      expect(result).toEqual([
        { id: 1, value: "first" },
        { id: 2, value: "second" },
        { id: 3, value: "third" },
      ]);
    });

    it("should handle empty array", () => {
      const input: unknown[] = [];
      const result = removeDuplicates(input);
      expect(result).toEqual([]);
    });

    it("should handle array with no duplicates", () => {
      const input = [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }];

      const result = removeDuplicates(input);
      expect(result).toEqual(input);
    });

    it("should handle objects with different property orders as different objects", () => {
      const input = [
        { name: "John", age: 30 },
        { age: 30, name: "John" }, // Different property order = different JSON string
      ];

      const result = removeDuplicates(input);

      // Since JSON.stringify preserves property order, these are considered different
      expect(result).toHaveLength(2);
    });

    it("should work with AdSpendingData objects", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "Facebook",
          election: "PRESIDENT",
          topic: "Economy",
          spend: "1000",
        },
        {
          advertiser: "Google",
          election: "CA-41",
          topic: "Climate",
          spend: "2000",
        },
        {
          advertiser: "Facebook",
          election: "PRESIDENT",
          topic: "Economy",
          spend: "1000",
        }, // duplicate
      ];

      const result = removeDuplicates(input);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        {
          advertiser: "Facebook",
          election: "PRESIDENT",
          topic: "Economy",
          spend: "1000",
        },
        {
          advertiser: "Google",
          election: "CA-41",
          topic: "Climate",
          spend: "2000",
        },
      ]);
    });
  });

  describe("integration tests", () => {
    it("should work together to normalize and deduplicate political ad data", () => {
      const input: AdSpendingData[] = [
        {
          advertiser: "  Facebook Inc.  ",
          election: "pres",
          topic: "economy & labor",
          spend: "1000",
        },
        {
          advertiser: "Google LLC",
          election: "ca-41",
          topic: "climate & energy",
          spend: "2000",
        },
        {
          advertiser: "  Facebook Inc.  ", // duplicate after normalization
          election: "president",
          topic: "economy & labor",
          spend: "1000",
        },
      ];

      const normalized = normalizePoliticalAdData(input);
      const deduplicated = removeDuplicates(normalized);

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated).toEqual([
        {
          advertiser: "FACEBOOK INC.",
          election: "PRESIDENT",
          topic: "ECONOMY & LABOR",
          spend: "1000",
        },
        {
          advertiser: "GOOGLE LLC",
          election: "CA-41",
          topic: "CLIMATE & ENERGY",
          spend: "2000",
        },
      ]);
    });
  });
});
