/**
 * Test script specifically for Fizza's appointment issue
 * This will help debug why the appointment is not showing in the calendar
 */

// Mock the exact data from the API response
const fizzaBooking = {
  "id": "68fc816b88b92ffc588c824d",
  "tenant_id": "07487f88-c420-486a-8fd6-96de878ab2a6",
  "service_id": "ac198328-00a5-4f98-a15c-7f7007c0a0ec",
  "barber_id": "e07203d4-a230-42bb-8a8c-c9c2af7297c8",
  "start_time": "2025-10-27T19:00:00", // No timezone marker - this is the problem!
  "end_time": "2025-10-27T19:30:00",   // No timezone marker
  "customer": {
    "name": "fizza",
    "phone": "+1 (932) 394-5267",
    "email": "qataxavip@mailinator.com",
    "notes": null
  },
  "notes": "Et sunt suscipit re",
  "status": "confirmed",
  "created_at": "2025-10-25T07:51:07.593000",
  "updated_at": "2025-10-25T07:51:07.593000",
  "google_event_id": null,
  "sms_sent": false,
  "email_sent": false,
  "booking_hash": "2465e77195231615",
  "service": {
    "id": "68f3b4cdc56dc159d78a68a7",
    "name": "Men's Haircut",
    "duration_minutes": 30,
    "price": 30
  },
  "barber": {
    "id": "68f3b4cdc56dc159d78a68a8",
    "name": "David"
  },
  "client": {
    "name": "fizza",
    "phone": "+1 (932) 394-5267",
    "email": "qataxavip@mailinator.com",
    "notes": null
  },
  "time": "19:00",
  "date": "2025-10-27",
  "channel": "web"
};

console.log('🧪 Testing Fizza\'s appointment timezone conversion...\n');

// Test 1: Check what happens with the original timezone-less timestamps
console.log('1. Original API timestamps (without timezone):');
console.log('   start_time:', fizzaBooking.start_time);
console.log('   end_time:', fizzaBooking.end_time);

// Test 2: What happens when we parse them as local time (wrong)
console.log('\n2. Parsing as local time (WRONG - this is what was happening before):');
const wrongStart = new Date(fizzaBooking.start_time);
const wrongEnd = new Date(fizzaBooking.end_time);
console.log('   start (local):', wrongStart.toISOString());
console.log('   end (local):', wrongEnd.toISOString());
console.log('   start (NY time):', wrongStart.toLocaleString('en-US', { timeZone: 'America/New_York' }));
console.log('   end (NY time):', wrongEnd.toLocaleString('en-US', { timeZone: 'America/New_York' }));

// Test 3: What happens when we normalize them (correct)
console.log('\n3. Normalizing timestamps (CORRECT - this is what our fix does):');
const normalizedStart = fizzaBooking.start_time + 'Z'; // Add Z suffix
const normalizedEnd = fizzaBooking.end_time + 'Z';     // Add Z suffix
console.log('   normalized start:', normalizedStart);
console.log('   normalized end:', normalizedEnd);

const correctStart = new Date(normalizedStart);
const correctEnd = new Date(normalizedEnd);
console.log('   start (UTC):', correctStart.toISOString());
console.log('   end (UTC):', correctEnd.toISOString());
console.log('   start (NY time):', correctStart.toLocaleString('en-US', { timeZone: 'America/New_York' }));
console.log('   end (NY time):', correctEnd.toLocaleString('en-US', { timeZone: 'America/New_York' }));

// Test 4: Expected result
console.log('\n4. Expected result:');
console.log('   Appointment should show at: 3:00 PM on October 27, 2025 (America/New_York)');
console.log('   This is because 19:00 UTC = 3:00 PM EDT (Eastern Daylight Time)');

// Test 5: Check if the appointment would be in the correct date range
console.log('\n5. Date range check:');
const appointmentDate = new Date('2025-10-27T19:00:00Z');
const currentDate = new Date('2025-10-27'); // Assuming we're viewing October 27
const startOfDay = new Date(currentDate);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(currentDate);
endOfDay.setHours(23, 59, 59, 999);

console.log('   Appointment date:', appointmentDate.toDateString());
console.log('   Current date:', currentDate.toDateString());
console.log('   Start of day:', startOfDay.toDateString());
console.log('   End of day:', endOfDay.toDateString());
console.log('   Is in range:', appointmentDate >= startOfDay && appointmentDate <= endOfDay);

console.log('\n✅ Analysis complete!');
console.log('   The issue was that timestamps without timezone markers were being parsed as local time');
console.log('   instead of UTC time. Our fix should resolve this by normalizing the timestamps.');
