import 'dotenv/config';
import app from './app.js';
import { initializeSampleData } from './data/sampleData.js';

const PORT = process.env.BACKEND_PORT || 3000;

// Init demo data
initializeSampleData();

app.listen(PORT, () => {
  console.log('\n=== Luna Backend Server ===');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  POST /api/temperature`);
  console.log(`  GET  /api/data`);
  console.log(`  GET  /api/today`);
  console.log(`  GET  /api/phase`);
  console.log(`  GET  /api/tips`);
  console.log(`  GET  /api/health\n`);
});
