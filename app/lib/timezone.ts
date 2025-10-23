/**
 * Timezone utility functions for converting UTC times to tenant timezone
 * Uses native Date + Intl API for timezone handling
 */

/**
 * Convert UTC datetime to tenant timezone
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string (e.g., 'America/New_York')
 * @returns {Object} - { date, time, fullDateTime, timezone, rawDate }
 */
export const convertToTenantTimezone = (utcDateTime: string | Date, tenantTimezone: string = 'America/New_York') => {
  try {
    console.log('Converting timezone:', { utcDateTime, tenantTimezone });
    
    // Robust timezone detection: check for explicit timezone indicators
    let utcDateTimeStr = typeof utcDateTime === 'string' ? utcDateTime : utcDateTime.toISOString();
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      // If no timezone info, treat as UTC by appending 'Z'
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    // Create date object from UTC datetime
    const utcDate = new Date(utcDateTimeStr);
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.error('Invalid date provided:', utcDateTime);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        fullDateTime: 'Invalid DateTime',
        timezone: tenantTimezone,
        rawDate: null
      };
    }

    // Format date in tenant timezone (e.g., "Oct 22, 2025")
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: tenantTimezone
    };
    const formattedDate = utcDate.toLocaleDateString('en-US', dateOptions);
    
    // Format time in tenant timezone (e.g., "2:00 PM")
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: tenantTimezone
    };
    const formattedTime = utcDate.toLocaleTimeString('en-US', timeOptions);
    
    // Full datetime string in tenant timezone
    const fullDateTime = utcDate.toLocaleString('en-US', {
      ...dateOptions,
      ...timeOptions
    });
    
    // Create a proper date object in tenant timezone for rawDate
    const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tenantTimezone }));

    console.log('Timezone conversion result:', {
      input: utcDateTime,
      utcDate: utcDate.toISOString(),
      tenantTimezone,
      formattedTime,
      formattedDate,
      fullDateTime
    });

    return {
      date: formattedDate,
      time: formattedTime,
      fullDateTime: fullDateTime,
      timezone: tenantTimezone,
      rawDate: tenantDate
    };
  } catch (error) {
    console.error('Error converting timezone:', error);
    return {
      date: 'Error',
      time: 'Error',
      fullDateTime: 'Error',
      timezone: tenantTimezone,
      rawDate: null
    };
  }
};

/**
 * Get timezone offset string (e.g., "EDT", "EST", "PST")
 * @param {string} tenantTimezone - IANA timezone string
 * @returns {string} - Timezone abbreviation
 */
export const getTimezoneAbbreviation = (tenantTimezone: string = 'America/New_York'): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tenantTimezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart ? timeZonePart.value : tenantTimezone;
  } catch (error) {
    console.error('Error getting timezone abbreviation:', error);
    return tenantTimezone;
  }
};

/**
 * Check if a date is today in tenant timezone
 * @param {string|Date} utcDateTime - UTC datetime string or Date object
 * @param {string} tenantTimezone - IANA timezone string
 * @returns {boolean} - True if date is today
 */
export const isTodayInTenantTimezone = (utcDateTime: string | Date, tenantTimezone: string = 'America/New_York'): boolean => {
  try {
    let utcDateTimeStr = typeof utcDateTime === 'string' ? utcDateTime : utcDateTime.toISOString();
    
    // Check if the string already has timezone information
    const hasTimezoneInfo = utcDateTimeStr.endsWith('Z') || 
                           utcDateTimeStr.includes('+') || 
                           /[+-]\d{2}:\d{2}$/.test(utcDateTimeStr);
    
    if (!hasTimezoneInfo) {
      utcDateTimeStr = utcDateTimeStr + 'Z';
    }
    
    const utcDate = new Date(utcDateTimeStr);
    const tenantDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tenantTimezone }));
    const today = new Date();
    const tenantToday = new Date(today.toLocaleString('en-US', { timeZone: tenantTimezone }));
    
    return tenantDate.toDateString() === tenantToday.toDateString();
  } catch (error) {
    console.error('Error checking if today:', error);
    return false;
  }
};

/**
 * Common timezone mappings for user-friendly names
 */
export const TIMEZONE_MAPPINGS: Record<string, string> = {
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'Europe/London': 'Greenwich Mean Time (GMT)',
  'Asia/Karachi': 'Pakistan Standard Time (PKT)',
  'Asia/Kolkata': 'Indian Standard Time (IST)',
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Australia/Sydney': 'Australian Eastern Time (AET)'
};

/**
 * Get user-friendly timezone name
 * @param {string} ianaTimezone - IANA timezone string
 * @returns {string} - User-friendly timezone name
 */
export const getTimezoneDisplayName = (ianaTimezone: string): string => {
  return TIMEZONE_MAPPINGS[ianaTimezone] || ianaTimezone;
};
