/**
 * Test script to understand calendar positioning for Fizza's appointment
 */

// Mock the time slots generation (same as in the calendar)
const generateTimeSlots = () => {
  const startHour = 8; // 8 AM
  const endHour = 20;  // 8 PM
  const slotDuration = 30; // 30 minutes
  
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = ((hour % 12) === 0) ? 12 : (hour % 12);
      const displayMinute = minute.toString().padStart(2, '0');
      slots.push({
        time: `${displayHour}:${displayMinute} ${period}`,
        hour,
        minute
      });
    }
  }
  return slots;
};

console.log('🧪 Testing calendar positioning for Fizza\'s appointment...\n');

// Generate time slots
const timeSlots = generateTimeSlots();

console.log('1. Time slots generated:');
console.log('   Total slots:', timeSlots.length);
console.log('   Time range: 8:00 AM to 7:30 PM (30-minute intervals)');

// Find 3:00 PM slot
const slot3PM = timeSlots.find(slot => slot.hour === 15 && slot.minute === 0);
console.log('\n2. 3:00 PM slot:');
console.log('   Found:', slot3PM);

if (slot3PM) {
  const slotIndex = timeSlots.findIndex(slot => slot.hour === 15 && slot.minute === 0);
  console.log('   Slot index:', slotIndex);
  console.log('   Position (slotIndex * 32):', slotIndex * 32);
}

// Test Fizza's appointment positioning
console.log('\n3. Fizza\'s appointment positioning:');
console.log('   Appointment time: 3:00 PM (15:00)');
console.log('   Expected slot: hour=15, minute=0');

// Calculate position like the calendar does
const startHour = 15; // 3:00 PM
const startMinute = 0;
const slotIndex = timeSlots.findIndex(slot => 
  slot.hour === startHour && slot.minute === startMinute
);

console.log('   Slot index found:', slotIndex);

if (slotIndex >= 0) {
  const topPosition = slotIndex * 32;
  console.log('   Top position:', topPosition);
  console.log('   Max position (timeSlots.length * 32):', timeSlots.length * 32);
  console.log('   Is valid position:', topPosition >= 0 && topPosition <= timeSlots.length * 32);
} else {
  console.log('   ❌ Slot not found! This is the problem.');
  console.log('   Available slots around 3 PM:');
  const slotsAround3PM = timeSlots.filter(slot => slot.hour >= 14 && slot.hour <= 16);
  slotsAround3PM.forEach(slot => {
    console.log(`     ${slot.hour}:${slot.minute.toString().padStart(2, '0')} (${slot.time})`);
  });
}

// Test the fallback calculation
console.log('\n4. Fallback calculation:');
const fallbackPosition = ((startHour - 8) * 64) + (startMinute * 64 / 60);
console.log('   Fallback position:', fallbackPosition);
console.log('   Is valid fallback:', fallbackPosition >= 0 && fallbackPosition <= timeSlots.length * 32);

console.log('\n✅ Analysis complete!');
console.log('   If slot not found, the appointment won\'t render in the calendar.');
console.log('   This explains why Fizza\'s appointment is loaded but not visible.');
