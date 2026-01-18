import 'dotenv/config';
import app from './app.js';
import { seedSampleData } from './db/temperatureRepository.js';

const PORT = process.env.BACKEND_PORT || 3000;

// Seed sample data if database is empty
seedSampleData();

app.listen(PORT, () => {
  console.log('\n=== Luna Backend Server ===');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: SQLite (luna.db)`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/temperature       - Add temperature reading`);
  console.log(`  POST /api/temperature/seed  - Seed sample data`);
  console.log(`  GET  /api/temperature/today - Get today's summary`);
  console.log(`  GET  /api/temperature/calendar - Get calendar data`);
  console.log(`  GET  /api/data              - Get historical data`);
  console.log(`  GET  /api/data/chart        - Get chart data`);
  console.log(`  GET  /api/bunny             - Get AI guidance`);
  console.log(`  POST /api/bunny/ask         - Ask Luna a question\n`);
});
