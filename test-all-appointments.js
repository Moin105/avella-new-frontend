/**
 * Test script to verify all appointments are positioned correctly
 */

// Mock the appointments data from the debug panel
const appointments = [
  {
    client: "Sheikh",
    start_time: "2025-10-26T00:00:00Z",
    expected: "8:00 PM on Oct 25, 2025 (NY time)"
  },
  {
    client: "suli", 
    start_time: "2025-10-26T03:00:00Z",
    expected: "11:00 PM on Oct 25, 2025 (NY time)"
  },
  {
    client: "SANJU",
    start_time: "2025-10-26T15:00:00Z", 
    expected: "11:00 AM on Oct 26, 2025 (NY time)"
  },
  {
    client: "sanfgi",
    start_time: "2025-10-26T23:00:00Z",
    expected: "7:00 PM on Oct 26, 2025 (NY time)"
  },
  {
    client: "fizza",
    start_time: "2025-10-27T19:00:00Z",
    expected: "3:00 PM on Oct 27, 2025 (NY time)"
  }
];

console.log('🧪 Testing all appointments timezone conversion...\n');

appointments.forEach((apt, index) => {
  console.log(`${index + 1}. ${apt.client}:`);
  
  // Parse the UTC time
  const utcDate = new Date(apt.start_time);
  console.log(`   UTC: ${utcDate.toISOString()}`);
  
  // Convert to New York time
  const nyTime = utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  console.log(`   NY: ${nyTime}`);
  
  // Get the hour and minute for calendar positioning
  const hour = utcDate.getHours();
  const minute = utcDate.getMinutes();
  console.log(`   Hour: ${hour}, Minute: ${minute}`);
  
  // Calculate calendar position (3:00 PM = hour 15, minute 0)
  const slotIndex = (hour - 8) * 2 + (minute / 30); // 8 AM = 0, 8:30 AM = 1, etc.
  console.log(`   Slot Index: ${slotIndex}`);
  console.log(`   Expected: ${apt.expected}`);
  console.log('');
});

console.log('✅ Analysis complete!');
console.log('   Check if the appointments are appearing at the correct times in the calendar.');
console.log('   The issue might be that appointments are being converted to the wrong timezone.');
