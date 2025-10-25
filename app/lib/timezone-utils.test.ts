/**
 * Unit tests for timezone utility functions
 */

import { buildSlotUTCISO, formatUTCToTenantTime, isValidTimezone, getTimezoneInfo } from './timezone-utils';

describe('buildSlotUTCISO', () => {
  test('converts 12:00 PM America/New_York Oct 26 2025 to 2025-10-26T16:00:00Z', () => {
    const { startISO, endISO } = buildSlotUTCISO("2025-10-26", 12, 0, "America/New_York", 30);
    
    expect(startISO.startsWith("2025-10-26T16:00:00")).toBe(true);
    expect(startISO.endsWith("Z")).toBe(true);
    expect(endISO.startsWith("2025-10-26T16:30:00")).toBe(true);
    expect(endISO.endsWith("Z")).toBe(true);
  });

  test('converts 7:30 PM America/New_York Oct 25 2025 to correct UTC', () => {
    const { startISO, endISO } = buildSlotUTCISO("2025-10-25", 19, 30, "America/New_York", 30);
    
    // Should be 7:30 PM EDT (UTC-4) = 11:30 PM UTC
    expect(startISO.startsWith("2025-10-25T23:30:00")).toBe(true);
    expect(startISO.endsWith("Z")).toBe(true);
    expect(endISO.startsWith("2025-10-26T00:00:00")).toBe(true);
    expect(endISO.endsWith("Z")).toBe(true);
  });

  test('handles DST transition correctly', () => {
    // March 10, 2024 - DST starts in America/New_York
    const { startISO } = buildSlotUTCISO("2024-03-10", 12, 0, "America/New_York", 30);
    
    expect(startISO.endsWith("Z")).toBe(true);
    expect(startISO).toMatch(/2024-03-10T1[67]:00:00\.000Z/); // Should be 16:00 or 17:00 UTC
  });

  test('throws error for invalid timezone', () => {
    expect(() => {
      buildSlotUTCISO("2025-10-26", 12, 0, "Invalid/Timezone", 30);
    }).toThrow();
  });

  test('throws error for invalid date', () => {
    expect(() => {
      buildSlotUTCISO("invalid-date", 12, 0, "America/New_York", 30);
    }).toThrow();
  });

  test('handles different durations', () => {
    const { startISO, endISO } = buildSlotUTCISO("2025-10-26", 12, 0, "America/New_York", 60);
    
    const startTime = new Date(startISO).getTime();
    const endTime = new Date(endISO).getTime();
    const duration = (endTime - startTime) / (1000 * 60); // Convert to minutes
    
    expect(duration).toBe(60);
  });
});

describe('formatUTCToTenantTime', () => {
  test('converts UTC back to tenant timezone', () => {
    const utcISO = "2025-10-26T16:00:00.000Z";
    const formatted = formatUTCToTenantTime(utcISO, "America/New_York");
    
    expect(formatted).toMatch(/2025-10-26 12:00:00/);
  });

  test('handles invalid UTC ISO gracefully', () => {
    const result = formatUTCToTenantTime("invalid-iso", "America/New_York");
    expect(result).toBe("invalid-iso");
  });
});

describe('isValidTimezone', () => {
  test('validates correct timezone', () => {
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("Asia/Karachi")).toBe(true);
  });

  test('rejects invalid timezone', () => {
    expect(isValidTimezone("Invalid/Timezone")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
  });
});

describe('getTimezoneInfo', () => {
  test('returns timezone info for valid timezone', () => {
    const info = getTimezoneInfo("America/New_York");
    expect(info.offset).toBeDefined();
    expect(info.abbreviation).toBeDefined();
  });

  test('handles invalid timezone gracefully', () => {
    const info = getTimezoneInfo("Invalid/Timezone");
    expect(info.offset).toBe("Invalid");
    expect(info.abbreviation).toBe("Invalid timezone");
  });
});
