import db from './database.js';

// Insert a new temperature reading
export function insertTemperature(temperature, timestamp) {
  const stmt = db.prepare(`
    INSERT INTO temperatures (temperature, timestamp)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(temperature, timestamp);
  return {
    id: result.lastInsertRowid,
    temperature,
    timestamp
  };
}

// Get all temperature readings (most recent first)
export function getAllTemperatures() {
  const stmt = db.prepare(`
    SELECT id, temperature, timestamp, created_at
    FROM temperatures
    ORDER BY timestamp DESC
  `);
  return stmt.all();
}

// Get temperatures for the last N days
export function getTemperaturesForDays(days = 14) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const stmt = db.prepare(`
    SELECT id, temperature, timestamp, created_at
    FROM temperatures
    WHERE timestamp >= ?
    ORDER BY timestamp ASC
  `);
  return stmt.all(cutoffDate.toISOString());
}

// Get temperature for a specific date
export function getTemperatureForDate(dateStr) {
  const stmt = db.prepare(`
    SELECT id, temperature, timestamp, created_at
    FROM temperatures
    WHERE date(timestamp) = date(?)
    ORDER BY timestamp DESC
    LIMIT 1
  `);
  return stmt.get(dateStr);
}

// Get temperatures for a specific month (for calendar)
export function getTemperaturesForMonth(year, month) {
  // month is 0-indexed (0 = January)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const stmt = db.prepare(`
    SELECT id, temperature, timestamp, created_at
    FROM temperatures
    WHERE timestamp >= ? AND timestamp <= ?
    ORDER BY timestamp ASC
  `);
  return stmt.all(startDate.toISOString(), endDate.toISOString());
}

// Get total count of readings
export function getReadingsCount() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM temperatures');
  return stmt.get().count;
}

// Delete old readings (keep last N days)
export function cleanupOldReadings(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const stmt = db.prepare(`
    DELETE FROM temperatures
    WHERE timestamp < ?
  `);
  const result = stmt.run(cutoffDate.toISOString());
  return result.changes;
}

// Get temperature statistics
export function getTemperatureStats() {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as count,
      AVG(temperature) as average,
      MIN(temperature) as min,
      MAX(temperature) as max
    FROM temperatures
  `);
  return stmt.get();
}

// Seed sample data for testing (only if database is empty)
export function seedSampleData() {
  const count = getReadingsCount();
  if (count > 0) {
    console.log(`Database already has ${count} readings, skipping seed`);
    return false;
  }

  console.log('Seeding sample temperature data...');
  
  const today = new Date();
  const readings = [];
  
  // Generate 14 days of sample data
  // Simulating a typical cycle pattern
  const baselineTemp = 36.4;
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(7, 0, 0, 0); // 7 AM readings
    
    let temp;
    if (i >= 10) {
      // Days 1-4: Pre-ovulation (lower temps)
      temp = baselineTemp + (Math.random() * 0.15 - 0.05);
    } else if (i >= 7) {
      // Days 5-7: Ovulation approaching
      temp = baselineTemp + 0.1 + (Math.random() * 0.1);
    } else {
      // Days 8-14: Post-ovulation/Luteal (higher temps)
      temp = baselineTemp + 0.3 + (Math.random() * 0.15);
    }
    
    readings.push({
      temperature: parseFloat(temp.toFixed(2)),
      timestamp: date.toISOString()
    });
  }
  
  // Insert all readings
  const insertStmt = db.prepare(`
    INSERT INTO temperatures (temperature, timestamp)
    VALUES (?, ?)
  `);
  
  const insertMany = db.transaction((readings) => {
    for (const reading of readings) {
      insertStmt.run(reading.temperature, reading.timestamp);
    }
  });
  
  insertMany(readings);
  console.log(`✓ Seeded ${readings.length} sample temperature readings`);
  return true;
}
