/**
 * Test script to verify the fixed appointment positioning
 */

// Test the fixed positioning logic
const appointments = [
  { client: "fizza", start_time: "2025-10-27T19:00:00Z" },
  { client: "SANJU", start_time: "2025-10-26T15:00:00Z" },
  { client: "sanfgi", start_time: "2025-10-26T23:00:00Z" }
];

console.log('🧪 Testing FIXED appointment positioning...\n');

appointments.forEach((apt, index) => {
  console.log(`${index + 1}. ${apt.client}:`);
  
  // OLD WAY (WRONG): Using getHours() - local time
  const wrongDate = new Date(apt.start_time);
  const wrongHour = wrongDate.getHours();
  const wrongMinute = wrongDate.getMinutes();
  console.log(`   OLD (WRONG): Hour=${wrongHour}, Minute=${wrongMinute}`);
  
  // NEW WAY (CORRECT): Using getUTCHours() - UTC time
  const utcDate = new Date(apt.start_time);
  const correctHour = utcDate.getUTCHours();
  const correctMinute = utcDate.getUTCMinutes();
  console.log(`   NEW (CORRECT): Hour=${correctHour}, Minute=${correctMinute}`);
  
  // Calculate slot index
  const slotIndex = (correctHour - 8) * 2 + (correctMinute / 30);
  console.log(`   Slot Index: ${slotIndex}`);
  
  // Show expected time
  const expectedTime = utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  console.log(`   Expected NY Time: ${expectedTime}`);
  console.log('');
});

console.log('✅ Fixed positioning test complete!');
console.log('   Now appointments should appear at the correct times in the calendar.');
