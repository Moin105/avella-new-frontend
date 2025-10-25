/**
 * Unit tests for timezone utility functions
 */

import { normalizeToUTCString, bookingToCalendarEvent } from '../timezone-utils';

describe('normalizeToUTCString', () => {
  test('should add Z suffix to strings without timezone info', () => {
    expect(normalizeToUTCString('2025-10-26T23:00:00')).toBe('2025-10-26T23:00:00Z');
    expect(normalizeToUTCString('2025-10-26T23:00:00.000')).toBe('2025-10-26T23:00:00.000Z');
  });

  test('should not modify strings that already have timezone info', () => {
    expect(normalizeToUTCString('2025-10-26T23:00:00Z')).toBe('2025-10-26T23:00:00Z');
    expect(normalizeToUTCString('2025-10-26T23:00:00.000Z')).toBe('2025-10-26T23:00:00.000Z');
    expect(normalizeToUTCString('2025-10-26T23:00:00+05:00')).toBe('2025-10-26T23:00:00+05:00');
    expect(normalizeToUTCString('2025-10-26T23:00:00-05:00')).toBe('2025-10-26T23:00:00-05:00');
  });

  test('should handle edge cases', () => {
    expect(normalizeToUTCString('')).toBe('');
    expect(normalizeToUTCString(null as any)).toBe(null);
    expect(normalizeToUTCString(undefined as any)).toBe(undefined);
  });
});

describe('bookingToCalendarEvent', () => {
  const mockBooking = {
    id: 'test-booking-1',
    start_time: '2025-10-26T23:00:00.000Z',
    end_time: '2025-10-26T23:30:00.000Z',
    service: { name: 'Haircut' },
    client: { name: 'John Doe', phone: '+1234567890', email: 'john@example.com' },
    barber: { name: 'Mike Barber' },
    barber_id: 'barber-123',
    status: 'confirmed',
    notes: 'Regular haircut'
  };

  test('should convert booking with proper timezone handling', () => {
    const tenantZone = 'America/New_York';
    const event = bookingToCalendarEvent(mockBooking, tenantZone);

    expect(event.id).toBe('test-booking-1');
    expect(event.client).toBe('John Doe');
    expect(event.service).toBe('Haircut');
    expect(event.barber).toBe('Mike Barber');
    expect(event.status).toBe('confirmed');
    expect(event.notes).toBe('Regular haircut');
    
    // Check that start and end are proper Date objects
    expect(event.start).toBeInstanceOf(Date);
    expect(event.end).toBeInstanceOf(Date);
    
    // Check that the dates are valid
    expect(event.start.getTime()).not.toBeNaN();
    expect(event.end.getTime()).not.toBeNaN();
    
    // Check display properties
    expect(event.displayTime).toBeDefined();
    expect(event.displayDate).toBeDefined();
    expect(event.displayDateTime).toBeDefined();
    expect(event.timezone).toBe(tenantZone);
  });

  test('should handle booking without timezone marker', () => {
    const bookingWithoutZ = {
      ...mockBooking,
      start_time: '2025-10-26T23:00:00', // No Z suffix
      end_time: '2025-10-26T23:30:00'    // No Z suffix
    };

    const tenantZone = 'America/New_York';
    const event = bookingToCalendarEvent(bookingWithoutZ, tenantZone);

    expect(event.start).toBeInstanceOf(Date);
    expect(event.end).toBeInstanceOf(Date);
    expect(event.start.getTime()).not.toBeNaN();
    expect(event.end.getTime()).not.toBeNaN();
  });

  test('should handle different booking data shapes', () => {
    const alternativeBooking = {
      id: 'test-booking-2',
      start_time: '2025-10-26T23:00:00.000Z',
      end_time: '2025-10-26T23:30:00.000Z',
      service: 'Haircut', // Direct string instead of object
      customer_name: 'Jane Doe', // Different field name
      staff_name: 'Sarah Barber', // Different field name
      staff_id: 'staff-456',
      status: 'pending'
    };

    const tenantZone = 'America/New_York';
    const event = bookingToCalendarEvent(alternativeBooking, tenantZone);

    expect(event.id).toBe('test-booking-2');
    expect(event.client).toBe('Jane Doe');
    expect(event.service).toBe('Haircut');
    expect(event.barber).toBe('Sarah Barber');
    expect(event.barberId).toBe('staff-456');
    expect(event.status).toBe('pending');
  });

  test('should throw error for invalid booking data', () => {
    const invalidBooking = {
      id: 'test-booking-3',
      start_time: 'invalid-date',
      end_time: 'invalid-date'
    };

    const tenantZone = 'America/New_York';
    
    expect(() => {
      bookingToCalendarEvent(invalidBooking, tenantZone);
    }).toThrow();
  });

  test('should handle booking with Retell channel detection', () => {
    const retellBooking = {
      ...mockBooking,
      booking_hash: 'retell_12345'
    };

    const tenantZone = 'America/New_York';
    const event = bookingToCalendarEvent(retellBooking, tenantZone);

    expect(event.channel).toBe('ai_agent');
  });

  test('should preserve original time fields', () => {
    const tenantZone = 'America/New_York';
    const event = bookingToCalendarEvent(mockBooking, tenantZone);

    expect(event.start_time).toBe(mockBooking.start_time);
    expect(event.end_time).toBe(mockBooking.end_time);
    expect(event.startTenantISO).toBeDefined();
    expect(event.endTenantISO).toBeDefined();
  });
});
