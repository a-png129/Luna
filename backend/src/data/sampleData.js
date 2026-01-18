import { temperatureReadings } from './store.js';

// ========== SAMPLE DATA INITIALIZATION ==========

export function initializeSampleData() {
  // Generate sample data for last 14 days
  const now = new Date();
  const baseTemp = 36.5; // Base BBT in Celsius
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(7, 0, 0, 0); // Morning reading time
    
    // Simulate cycle pattern
    const cycleDay = (i % 28) + 1;
    let temp = baseTemp;
    
    if (cycleDay >= 1 && cycleDay <= 5) {
      temp = baseTemp - 0.2 + (Math.random() * 0.1); // Menstrual: lower
    } else if (cycleDay >= 6 && cycleDay <= 13) {
      temp = baseTemp - 0.1 + (Math.random() * 0.15); // Follicular: rising
    } else if (cycleDay >= 14 && cycleDay <= 16) {
      temp = baseTemp + 0.4 + (Math.random() * 0.1); // Ovulation: peak
    } else {
      temp = baseTemp + 0.3 + (Math.random() * 0.15); // Luteal: sustained high
    }
    
    temperatureReadings.push({
      temperature: parseFloat(temp.toFixed(2)),
      timestamp: date.toISOString(),
      id: date.getTime()
    });
  }
  
  console.log(`Initialized with ${temperatureReadings.length} sample readings`);
}
