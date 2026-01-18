import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in backend directory
const dbPath = path.join(__dirname, '../../luna.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Initialize tables
function initializeDatabase() {
  // Create temperatures table
  db.exec(`
    CREATE TABLE IF NOT EXISTS temperatures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      temperature REAL NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index on timestamp for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_temperatures_timestamp 
    ON temperatures(timestamp)
  `);

  console.log('✓ Database initialized');
}

// Initialize on import
initializeDatabase();

export default db;
