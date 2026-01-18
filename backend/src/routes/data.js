import express from 'express';
import { 
  getAllTemperatures, 
  getTemperaturesForDays,
  getReadingsCount 
} from '../db/temperatureRepository.js';
import { detectOvulation } from '../domain/cycleAnalysis.js';

const router = express.Router();

// Helper to get readings in the format expected by cycle analysis
function getReadingsArray() {
  return getAllTemperatures().reverse().map(r => ({
    id: r.id,
    temperature: r.temperature,
    timestamp: r.timestamp
  }));
}

// GET /data - Get historical BBT data
router.get('/', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14; // Default to 14 days
    const filtered = getTemperaturesForDays(days);
    
    res.json({
      readings: filtered,
      count: filtered.length,
      days: days
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /data/chart - Get BBT data formatted for charts with ovulation markers
router.get('/chart', (req, res) => {
  try {
    const readings = getReadingsArray();
    const sorted = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sorted.length === 0) {
      return res.json({ 
        temperatureData: [], 
        avgTemp: null,
        ovulationMarkers: [],
        message: 'No temperature data yet. Add readings via POST /api/temperature or POST /api/temperature/seed'
      });
    }

    // Detect ovulation
    const ovulation = detectOvulation(readings);
    
    // Format data with day numbers (days since first reading)
    const firstReading = sorted[0];
    const chartData = sorted.map((reading, index) => {
      const daysSinceFirst = Math.floor((new Date(reading.timestamp) - new Date(firstReading.timestamp)) / (1000 * 60 * 60 * 24));
      const isOvulationDay = ovulation && ovulation.detected && 
        new Date(reading.timestamp).toISOString().split('T')[0] === ovulation.date.toISOString().split('T')[0];
      
      return {
        day: daysSinceFirst + 1, // Day 1, 2, 3, etc.
        temp: reading.temperature,
        date: reading.timestamp,
        isOvulationDay: isOvulationDay || false
      };
    });

    // Calculate average temperature
    const avgTemp = sorted.reduce((sum, r) => sum + r.temperature, 0) / sorted.length;

    // Get ovulation markers for the chart
    const ovulationMarkers = ovulation && ovulation.detected ? [{
      day: chartData.findIndex(d => d.isOvulationDay) + 1,
      date: ovulation.date.toISOString().split('T')[0],
      temperature: ovulation.postOvulationTemp,
      confidence: ovulation.confidence
    }] : [];

    res.json({
      temperatureData: chartData,
      avgTemp: parseFloat(avgTemp.toFixed(1)),
      ovulationMarkers: ovulationMarkers,
      ovulation: ovulation,
      totalReadings: getReadingsCount()
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
