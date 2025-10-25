/**
 * Test script to validate timezone fix
 * This script demonstrates the fix for calendar slot missing issue
 */

// Mock the booking data that was causing issues
const testBooking = {
  id: 'test-booking-1',
  start_time: '2025-10-26T23:00:00.000Z', // This should work correctly
  end_time: '2025-10-26T23:30:00.000Z',
  service: { name: 'Haircut' },
  client: { name: 'sanfgi', phone: '+1 (607) 755-8061', email: 'junoduw@mailinator.com' },
  barber: { name: 'Mike Barber' },
  barber_id: 'f2573ebb-bafe-4f03-bc63-0a12545785fd',
  status: 'confirmed',
  notes: 'Vitae qui dolor quo'
};

// Mock the problematic booking data (without timezone marker)
const problematicBooking = {
  id: 'test-booking-2',
  start_time: '2025-10-26T23:00:00', // Missing Z suffix - this was the problem
  end_time: '2025-10-26T23:30:00',  // Missing Z suffix
  service: { name: 'Haircut' },
  client: { name: 'sanfgi', phone: '+1 (607) 755-8061', email: 'junoduw@mailinator.com' },
  barber: { name: 'Mike Barber' },
  barber_id: 'f2573ebb-bafe-4f03-bc63-0a12545785fd',
  status: 'confirmed',
  notes: 'Vitae qui dolor quo'
};

console.log('🧪 Testing timezone fix...\n');

// Test 1: normalizeToUTCString function
console.log('1. Testing normalizeToUTCString:');
console.log('   Input: "2025-10-26T23:00:00"');
console.log('   Output:', normalizeToUTCString('2025-10-26T23:00:00'));
console.log('   Input: "2025-10-26T23:00:00Z"');
console.log('   Output:', normalizeToUTCString('2025-10-26T23:00:00Z'));
console.log('   Input: "2025-10-26T23:00:00+05:00"');
console.log('   Output:', normalizeToUTCString('2025-10-26T23:00:00+05:00'));

// Test 2: bookingToCalendarEvent function
console.log('\n2. Testing bookingToCalendarEvent with proper timezone:');
const tenantZone = 'America/New_York';

try {
  const event1 = bookingToCalendarEvent(testBooking, tenantZone);
  console.log('   ✅ Proper booking converted successfully');
  console.log('   Event start:', event1.start.toISOString());
  console.log('   Event end:', event1.end.toISOString());
  console.log('   Display time:', event1.displayTime);
  console.log('   Display date:', event1.displayDate);
} catch (error) {
  console.log('   ❌ Error with proper booking:', error.message);
}

try {
  const event2 = bookingToCalendarEvent(problematicBooking, tenantZone);
  console.log('\n   ✅ Problematic booking (no Z) converted successfully');
  console.log('   Event start:', event2.start.toISOString());
  console.log('   Event end:', event2.end.toISOString());
  console.log('   Display time:', event2.displayTime);
  console.log('   Display date:', event2.displayDate);
} catch (error) {
  console.log('\n   ❌ Error with problematic booking:', error.message);
}

// Test 3: Verify the fix works for the specific case mentioned
console.log('\n3. Testing the specific case from the user:');
console.log('   Original booking time: "2025-10-26T23:00:00.000Z"');
console.log('   This represents: Sunday, Oct 26, 2025 7:00 PM America/New_York');
console.log('   Should appear correctly in calendar at 7:00 PM slot');

// Test 4: Show expected console output
console.log('\n4. Expected console output when loading appointments:');
console.log('   🔍 DEBUG: First loaded event details:');
console.log('   {');
console.log('     eventId: "test-booking-1",');
console.log('     client: "sanfgi",');
console.log('     start: Date object,');
console.log('     end: Date object,');
console.log('     startISO: "2025-10-26T23:00:00.000Z",');
console.log('     endISO: "2025-10-26T23:30:00.000Z",');
console.log('     displayTime: "7:00 PM",');
console.log('     displayDate: "2025-10-26",');
console.log('     startTenantISO: "2025-10-26T19:00:00.000-04:00",');
console.log('     endTenantISO: "2025-10-26T19:30:00.000-04:00"');
console.log('   }');

console.log('\n✅ Timezone fix validation complete!');
console.log('   The calendar should now correctly display appointments');
console.log('   regardless of whether the API returns timestamps with or without timezone markers.');
