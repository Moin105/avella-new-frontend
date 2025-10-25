/**
 * Test script to verify Fizza's appointment timezone conversion
 */

// Mock the exact data from the API response
const fizzaBooking = {
  "id": "68fc816b88b92ffc588c824d",
  "start_time": "2025-10-27T19:00:00", // No timezone marker
  "end_time": "2025-10-27T19:30:00",   // No timezone marker
  "client": { "name": "fizza" },
  "service": { "name": "Men's Haircut" },
  "barber": { "name": "David" }
};

console.log('🧪 Testing Fizza\'s appointment timezone conversion...\n');

// Test 1: Original timestamps
console.log('1. Original API timestamps:');
console.log('   start_time:', fizzaBooking.start_time);
console.log('   end_time:', fizzaBooking.end_time);

// Test 2: Normalize timestamps (add Z suffix)
const normalizedStart = fizzaBooking.start_time + 'Z';
const normalizedEnd = fizzaBooking.end_time + 'Z';
console.log('\n2. Normalized timestamps:');
console.log('   start_time:', normalizedStart);
console.log('   end_time:', normalizedEnd);

// Test 3: Parse as UTC
const startUTC = new Date(normalizedStart);
const endUTC = new Date(normalizedEnd);
console.log('\n3. Parsed as UTC:');
console.log('   start UTC:', startUTC.toISOString());
console.log('   end UTC:', endUTC.toISOString());

// Test 4: Convert to New York timezone
const startNY = startUTC.toLocaleString('en-US', { timeZone: 'America/New_York' });
const endNY = endUTC.toLocaleString('en-US', { timeZone: 'America/New_York' });
console.log('\n4. Converted to New York timezone:');
console.log('   start NY:', startNY);
console.log('   end NY:', endNY);

// Test 5: Check the date
const startDate = new Date(startUTC.toLocaleString('en-US', { timeZone: 'America/New_York' }));
const endDate = new Date(endUTC.toLocaleString('en-US', { timeZone: 'America/New_York' }));
console.log('\n5. Date analysis:');
console.log('   start date:', startDate.toDateString());
console.log('   end date:', endDate.toDateString());

// Test 6: Expected result
console.log('\n6. Expected result:');
console.log('   Appointment should show at: 3:00 PM on October 27, 2025');
console.log('   This is because 19:00 UTC = 3:00 PM EDT (Eastern Daylight Time)');

// Test 7: Check if this matches what we expect
const expectedDate = new Date('2025-10-27');
const isCorrectDate = startDate.toDateString() === expectedDate.toDateString();
const isCorrectTime = startNY.includes('3:00:00 PM');

console.log('\n7. Validation:');
console.log('   Correct date:', isCorrectDate);
console.log('   Correct time:', isCorrectTime);
console.log('   Overall correct:', isCorrectDate && isCorrectTime);

if (isCorrectDate && isCorrectTime) {
  console.log('\n✅ SUCCESS: Fizza\'s appointment should show correctly at 3:00 PM on October 27, 2025');
} else {
  console.log('\n❌ ISSUE: There\'s still a problem with the timezone conversion');
  console.log('   Expected: 3:00 PM on October 27, 2025');
  console.log('   Actual: ' + startNY + ' on ' + startDate.toDateString());
}
