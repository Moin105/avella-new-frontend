// Test script to verify appointment display timezone conversion
console.log('Testing appointment display timezone conversion...\n');

// Simulate the appointment data from the user
const appointmentData = {
  "start_time": "2025-10-24T15:00:00+00:00", // 3:00 PM UTC
  "customer": {
    "name": "Jenna Mitchell"
  }
};

console.log('Appointment data:');
console.log('- Start time (UTC):', appointmentData.start_time);
console.log('- Customer:', appointmentData.customer.name);

// Simulate the calendar date (October 24, 2025)
const calendarDate = new Date('2025-10-24');
console.log('\nCalendar date:', calendarDate.toDateString());

// Simulate the tenant timezone
const tenantTimezone = 'America/New_York';

// Convert appointment time to tenant timezone
const appointmentStart = new Date(appointmentData.start_time);
const appointmentInTenantTimezone = new Date(appointmentStart.toLocaleString('en-US', { timeZone: tenantTimezone }));

console.log('\nTimezone conversion:');
console.log('- UTC time:', appointmentStart.toISOString());
console.log('- Tenant timezone:', tenantTimezone);
console.log('- Converted to tenant timezone:', appointmentInTenantTimezone.toString());
console.log('- Date in tenant timezone:', appointmentInTenantTimezone.toDateString());
console.log('- Hour in tenant timezone:', appointmentInTenantTimezone.getHours());
console.log('- Minute in tenant timezone:', appointmentInTenantTimezone.getMinutes());

// Check if it matches the calendar date
const isSameDate = appointmentInTenantTimezone.toDateString() === calendarDate.toDateString();
console.log('\nDate comparison:');
console.log('- Calendar date:', calendarDate.toDateString());
console.log('- Appointment date (tenant timezone):', appointmentInTenantTimezone.toDateString());
console.log('- Same date:', isSameDate);

// Check the time slot (should be 11:00 AM)
const appointmentHour = appointmentInTenantTimezone.getHours();
const appointmentMinute = appointmentInTenantTimezone.getMinutes();
console.log('\nTime slot:');
console.log('- Appointment time in tenant timezone:', `${appointmentHour}:${appointmentMinute.toString().padStart(2, '0')}`);
console.log('- Expected: 11:00 AM');
console.log('- Correct time:', appointmentHour === 11 && appointmentMinute === 0 ? 'YES' : 'NO');

console.log('\n=== SUMMARY ===');
console.log('The appointment should now display at 11:00 AM in the tenant timezone.');
console.log('This should make it visible in the calendar at the correct time slot.');

