/**
 * Timezone utility functions for converting tenant-local times to UTC
 * Uses Luxon for reliable timezone handling
 */

import { DateTime } from "luxon";

/**
 * Convert tenant-local date + slot hour/minute into UTC ISO string.
 * @param dateStr  'YYYY-MM-DD' (selected date)
 * @param hour     integer 0-23 (slot hour in tenant time)
 * @param minute   integer 0-59
 * @param tz       IANA timezone string, e.g. 'America/New_York'
 * @param durationMinutes duration in minutes (default 30)
 * @returns { startISO: string, endISO: string }
 */
export function buildSlotUTCISO(
  dateStr: string, 
  hour: number, 
  minute: number, 
  tz: string, 
  durationMinutes: number = 30
): { startISO: string; endISO: string } {
  try {
    // Parse the date string (YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Create DateTime in tenant timezone
    const dtTenant = DateTime.fromObject({
      year,
      month,
      day,
      hour,
      minute,
      second: 0,
      millisecond: 0
    }, { zone: tz });

    if (!dtTenant.isValid) {
      throw new Error(`Invalid tenant date/time or timezone: ${dtTenant.invalidReason}`);
    }

    // Convert to UTC and get ISO string
    const startISO = dtTenant.toUTC().toISO();
    const endISO = dtTenant.plus({ minutes: durationMinutes }).toUTC().toISO();

    if (!startISO || !endISO) {
      throw new Error("Failed to convert to UTC ISO format");
    }

    return { startISO, endISO };
  } catch (error) {
    console.error("Error in buildSlotUTCISO:", error);
    throw new Error(`Timezone conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert UTC ISO string back to tenant timezone for display
 * @param utcISO UTC ISO string (e.g., "2025-10-26T16:00:00.000Z")
 * @param tz IANA timezone string
 * @returns Formatted time in tenant timezone
 */
export function formatUTCToTenantTime(utcISO: string, tz: string): string {
  try {
    const dt = DateTime.fromISO(utcISO, { zone: 'utc' });
    if (!dt.isValid) {
      throw new Error(`Invalid UTC ISO string: ${utcISO}`);
    }
    
    return dt.setZone(tz).toFormat('yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error("Error in formatUTCToTenantTime:", error);
    return utcISO; // Fallback to original string
  }
}

/**
 * Convert UTC time to tenant timezone and return as Date object for calendar positioning
 * @param utcISO UTC ISO string (e.g., "2025-10-26T16:00:00.000Z")
 * @param tz IANA timezone string
 * @returns Date object in tenant timezone
 */
export function convertUTCToTenantDate(utcISO: string, tz: string): Date {
  try {
    // Normalize UTC string (add Z if missing)
    const normalizedUTC = utcISO.endsWith('Z') ? utcISO : utcISO + 'Z';
    
    const dt = DateTime.fromISO(normalizedUTC, { zone: 'utc' });
    if (!dt.isValid) {
      throw new Error(`Invalid UTC ISO string: ${utcISO}`);
    }
    
    // Convert to tenant timezone and return as Date object
    const tenantDT = dt.setZone(tz);
    return tenantDT.toJSDate();
  } catch (error) {
    console.error("Error in convertUTCToTenantDate:", error);
    // Fallback to original parsing
    return new Date(utcISO);
  }
}

/**
 * Convert UTC time to tenant timezone and return formatted time string
 * @param utcISO UTC ISO string (e.g., "2025-10-26T16:00:00.000Z")
 * @param tz IANA timezone string
 * @param format Optional format string (default: "hh:mm a")
 * @returns Formatted time string in tenant timezone
 */
export function convertUTCToTenantTime(utcISO: string, tz: string, format: string = "h:mm a"): string {
  try {
    // Normalize UTC string (add Z if missing)
    const normalizedUTC = utcISO.endsWith('Z') ? utcISO : utcISO + 'Z';
    
    const dt = DateTime.fromISO(normalizedUTC, { zone: 'utc' });
    if (!dt.isValid) {
      throw new Error(`Invalid UTC ISO string: ${utcISO}`);
    }
    
    return dt.setZone(tz).toFormat(format);
  } catch (error) {
    console.error("Error in convertUTCToTenantTime:", error);
    return utcISO; // Fallback to original string
  }
}

/**
 * Validate timezone string
 * @param tz IANA timezone string
 * @returns boolean indicating if timezone is valid
 */
export function isValidTimezone(tz: string): boolean {
  try {
    const dt = DateTime.now().setZone(tz);
    return dt.isValid;
  } catch {
    return false;
  }
}

/**
 * Get timezone offset info for debugging
 * @param tz IANA timezone string
 * @returns Timezone offset information
 */
export function getTimezoneInfo(tz: string): { offset: string; abbreviation: string } {
  try {
    const dt = DateTime.now().setZone(tz);
    return {
      offset: dt.offsetNameShort,
      abbreviation: dt.offsetNameLong
    };
  } catch (error) {
    return { offset: 'Invalid', abbreviation: 'Invalid timezone' };
  }
}

/**
 * Normalize ISO string to ensure it has timezone marker
 * @param isoString ISO string that may or may not have timezone info
 * @returns Normalized ISO string with 'Z' suffix if no timezone info
 */
export function normalizeToUTCString(isoString: string): string {
  if (!isoString) return isoString;
  
  // If already has timezone info (Z or +/-), return as is
  if (isoString.includes('Z') || isoString.includes('+') || isoString.includes('-', 10)) {
    return isoString;
  }
  
  // If no timezone info, assume UTC and add 'Z'
  return isoString + 'Z';
}

/**
 * Convert booking data to calendar event format with proper timezone handling
 * @param booking Raw booking data from API
 * @param tenantZone IANA timezone string for the tenant
 * @returns Calendar event object with proper Date objects
 */
export function bookingToCalendarEvent(booking: any, tenantZone: string) {
  try {
    // Normalize the time strings
    const normalizedStart = normalizeToUTCString(booking.start_time);
    const normalizedEnd = normalizeToUTCString(booking.end_time);
    
    console.log('Booking timezone conversion:', {
      originalStart: booking.start_time,
      originalEnd: booking.end_time,
      normalizedStart,
      normalizedEnd,
      tenantZone
    });

    // Special debugging for Fizza's appointment
    if (booking.customer?.name === 'fizza' || booking.client?.name === 'fizza') {
      console.log('🔍 FIZZA TIMEZONE CONVERSION DEBUG:', {
        booking: booking,
        originalStart: booking.start_time,
        originalEnd: booking.end_time,
        normalizedStart,
        normalizedEnd,
        tenantZone
      });
    }
    
    // Parse as UTC using Luxon
    const startDT = DateTime.fromISO(normalizedStart, { zone: 'utc' });
    const endDT = DateTime.fromISO(normalizedEnd, { zone: 'utc' });
    
    if (!startDT.isValid || !endDT.isValid) {
      throw new Error(`Invalid date parsing: ${startDT.invalidReason || endDT.invalidReason}`);
    }
    
    // Convert to tenant timezone for display
    const startInTenant = startDT.setZone(tenantZone);
    const endInTenant = endDT.setZone(tenantZone);
    
    // Special debugging for timezone conversion
    console.log('🔍 TIMEZONE CONVERSION DEBUG:', {
      client: booking.client?.name || booking.customer?.name,
      originalStart: booking.start_time,
      normalizedStart,
      startDT: startDT.toISO(),
      startInTenant: startInTenant.toISO(),
      startInTenantLocal: startInTenant.toLocaleString(),
      tenantZone
    });
    
    // Create the event object
    // IMPORTANT: Use UTC times for positioning to avoid double conversion
    const event = {
      id: booking.id,
      title: `${booking.service?.name || booking.service || 'Service'} - ${booking.client?.name || booking.customer?.name || booking.customer_name || 'Client'}`,
      start: startDT.toJSDate(), // Use UTC time for positioning
      end: endDT.toJSDate(),     // Use UTC time for positioning
      barber: booking.barber?.name || booking.staff_name || booking.barber_name || 'Unknown',
      barberId: booking.barber_id || booking.staff_id || booking.barberId || booking.staffId,
      client: booking.client?.name || booking.customer?.name || booking.customer_name || 'Client',
      service: booking.service?.name || booking.service || 'Service',
      status: booking.status || 'confirmed',
      phone: booking.client?.phone || booking.customer?.phone || booking.customer_phone,
      email: booking.client?.email || booking.customer?.email || booking.customer_email,
      notes: booking.notes,
      // Display helpers
      displayTime: startInTenant.toFormat('h:mm a'),
      displayDate: startInTenant.toFormat('yyyy-MM-dd'),
      displayDateTime: startInTenant.toFormat('yyyy-MM-dd h:mm a'),
      timezone: tenantZone,
      channel: booking.channel || (booking.booking_hash && String(booking.booking_hash).startsWith('retell_')) ? 'ai_agent' : 'web',
      // Keep original time fields for reference
      start_time: booking.start_time,
      end_time: booking.end_time,
      // Add tenant-local ISO strings for debugging
      startTenantISO: startInTenant.toISO(),
      endTenantISO: endInTenant.toISO()
    };
    
    console.log('Converted event:', {
      id: event.id,
      client: event.client,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      startTenantISO: event.startTenantISO,
      endTenantISO: event.endTenantISO,
      displayTime: event.displayTime,
      displayDate: event.displayDate
    });

    // Special debugging for Fizza's appointment
    if (event.client === 'fizza') {
      console.log('🔍 FIZZA FINAL EVENT DEBUG:', {
        event: event,
        start: event.start,
        end: event.end,
        startISO: event.start.toISOString(),
        endISO: event.end.toISOString(),
        startLocal: event.start.toLocaleString(),
        endLocal: event.end.toLocaleString(),
        startNY: event.start.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        endNY: event.end.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        displayTime: event.displayTime,
        displayDate: event.displayDate,
        startTenantISO: event.startTenantISO,
        endTenantISO: event.endTenantISO
      });
      
      // Additional debugging for timezone conversion
      console.log('🔍 FIZZA TIMEZONE ANALYSIS:', {
        originalStart: booking.start_time,
        normalizedStart: normalizedStart,
        startDT: startDT.toISO(),
        startInTenant: startInTenant.toISO(),
        startInTenantLocal: startInTenant.toLocaleString(),
        startInTenantNY: startInTenant.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        tenantZone: tenantZone
      });
    }
    
    return event;
  } catch (error) {
    console.error('Error converting booking to calendar event:', error);
    console.error('Booking data:', booking);
    throw error;
  }
}