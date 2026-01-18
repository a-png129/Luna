import express from 'express';
import { temperatureReadings, userSettings } from '../data/store.js';
import {
  detectOvulation
} from '../domain/cycleAnalysis.js';

const router = express.Router();

// GET /data - Get historical BBT data
router.get('/', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14; // Default to 14 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const filtered = temperatureReadings
      .filter(r => new Date(r.timestamp) >= cutoff)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
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
    const sorted = [...temperatureReadings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sorted.length === 0) {
      return res.json({ 
        temperatureData: [], 
        avgTemp: null,
        ovulationMarkers: []
      });
    }

    // Detect ovulation
    const ovulation = detectOvulation(temperatureReadings);
    
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
      ovulation: ovulation
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;