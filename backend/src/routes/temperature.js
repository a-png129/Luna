// ESP + client API routes

// ========== API ENDPOINTS ==========

import express from 'express';
import { temperatureReadings } from '../data/store.js';
import { detectCurrentPhase, detectOvulation } from '../domain/cycleAnalysis.js';

const router = express.Router();

// POST /temperature - Receive BBT reading from ESP32
router.post('/', (req, res) => {
  try {
    const { temperature, timestamp } = req.body;
    
    if (!temperature || !timestamp) {
      return res.status(400).json({ error: 'Missing temperature or timestamp' });
    }
    
    const reading = {
      temperature: parseFloat(temperature),
      timestamp: new Date(parseInt(timestamp) * 1000).toISOString(), // Convert Unix timestamp to ISO
      id: Date.now()
    };
    
    temperatureReadings.push(reading);
    
    // Keep only last 90 days of readings
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    temperatureReadings = temperatureReadings.filter(r => new Date(r.timestamp) > cutoff);
    
    console.log(`✓ New reading: ${reading.temperature}°C at ${reading.timestamp}`);
    
    res.status(201).json({
      success: true,
      reading,
      message: 'Temperature reading recorded'
    });
  } catch (error) {
    console.error('Error processing temperature reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


// ============================================================


// GET /today - Get today's summary (temperature, phase, prediction)
router.get('/today', (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's reading if available
    const todayReading = temperatureReadings.find(r => {
      const readingDate = new Date(r.timestamp);
      readingDate.setHours(0, 0, 0, 0);
      return readingDate.getTime() === today.getTime();
    });
    
    // Detect current phase using BBT patterns
    const phaseInfo = detectCurrentPhase(temperatureReadings);
    
    res.json({
      date: today.toISOString().split('T')[0],
      temperature: todayReading ? todayReading.temperature : null,
      hasReading: !!todayReading,
      phase: phaseInfo.phase,
      phaseName: phaseInfo.phaseName,
      description: phaseInfo.description,
      tip: phaseInfo.tip,
      trend: phaseInfo.trend,
      avgBBT: parseFloat(phaseInfo.avgBBT.toFixed(2)),
      ovulation: phaseInfo.ovulation,
      periodPrediction: phaseInfo.periodPrediction,
      daysSinceOvulation: phaseInfo.daysSinceOvulation,
      readingsCount: temperatureReadings.length
    });
  } catch (error) {
    console.error('Error fetching today data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /phase - Get current cycle phase info (physiology-based)
router.get('/phase', (req, res) => {
  try {
    const phaseInfo = detectCurrentPhase(temperatureReadings);
    res.json(phaseInfo);
  } catch (error) {
    console.error('Error detecting phase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /calendar - Get calendar data with phase information (physiology-based)
router.get('/calendar', (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarData = [];
    
    // Detect ovulation for reference
    const ovulation = detectOvulation(temperatureReadings);
    const phaseInfo = detectCurrentPhase(temperatureReadings);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find if there's a reading for this day
      const dayReading = temperatureReadings.find(r => {
        const readingDate = new Date(r.timestamp);
        return readingDate.toISOString().split('T')[0] === dateStr;
      });
      
      let phase = null;
      let phaseColor = null;
      let isOvulationDay = false;
      
      if (dayReading) {
        // Check if this is the ovulation day
        if (ovulation && ovulation.detected) {
          const ovulationDateStr = ovulation.date.toISOString().split('T')[0];
          if (dateStr === ovulationDateStr) {
            isOvulationDay = true;
            phase = 'ovulation';
            phaseColor = '#93a7d1';
          } else {
            // Determine phase based on days since ovulation
            const daysSinceOv = Math.floor((date - ovulation.date) / (1000 * 60 * 60 * 24));
            if (daysSinceOv < 0) {
              phase = 'pre-ovulation';
              phaseColor = '#93a7d1';
            } else if (daysSinceOv <= 14) {
              phase = 'luteal';
              phaseColor = '#9d7089';
            } else {
              phase = 'pre-menstrual';
              phaseColor = '#c14a4a';
            }
          }
        } else {
          // No ovulation detected yet - use temperature to estimate
          const sorted = [...temperatureReadings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const avgBBT = sorted.reduce((sum, r) => sum + r.temperature, 0) / sorted.length;
          
          if (dayReading.temperature < avgBBT - 0.1) {
            phase = 'pre-ovulation';
            phaseColor = '#93a7d1';
          } else if (dayReading.temperature > avgBBT + 0.2) {
            phase = 'luteal';
            phaseColor = '#9d7089';
          }
        }
      }
      
      calendarData.push({
        day,
        date: dateStr,
        phase,
        phaseColor,
        hasReading: !!dayReading,
        temperature: dayReading ? dayReading.temperature : null,
        isOvulationDay: isOvulationDay
      });
    }
    
    res.json({
      year,
      month,
      daysInMonth,
      calendarData,
      ovulation: ovulation,
      currentPhase: phaseInfo.phase
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tips - Get tips based on detected phase (physiology-based)
router.get('/tips', (req, res) => {
  try {
    const phaseInfo = detectCurrentPhase(temperatureReadings);
    const currentPhase = phaseInfo.phase;

    // Tips based on detected phases (physiology-first)
    const phaseTips = {
      'pre-ovulation': {
        phase: "Pre-Ovulation",
        icon: "sparkles",
        color: "#93a7d1",
        tips: [
          {
            title: "Rising Energy",
            description: "Your body is preparing for ovulation. Energy and motivation may be increasing. Great time for planning and starting new projects.",
          },
          {
            title: "Build Momentum",
            description: "This phase often brings clarity and focus. Use this time to tackle tasks that require sustained attention.",
          },
          {
            title: "Social Connection",
            description: "You might feel more outgoing and social. Good time to connect with others and network.",
          },
        ],
      },
      'ovulation': {
        phase: "Ovulation Detected",
        icon: "activity",
        color: "#93a7d1",
        tips: [
          {
            title: "Peak Performance",
            description: "Your body has released an egg. Energy, mood, and cognitive function are often at their peak.",
          },
          {
            title: "High-Intensity Activities",
            description: "This is a great time for challenging workouts, important meetings, or creative projects.",
          },
          {
            title: "Communication",
            description: "Communication skills are often enhanced. Good time for important conversations.",
          },
        ],
      },
      'luteal': {
        phase: "Luteal Phase",
        icon: "brain",
        color: "#9d7089",
        tips: [
          {
            title: "Self-Care Priority",
            description: "Progesterone is high. Listen to your body's need for rest, nourishment, and gentler movement.",
          },
          {
            title: "Stable Energy",
            description: "Support your body with complex carbs, healthy fats, and adequate protein to maintain steady energy.",
          },
          {
            title: "Gentle Movement",
            description: "Yoga, walking, or stretching can feel better than high-intensity workouts during this phase.",
          },
        ],
      },
      'pre-menstrual': {
        phase: "Pre-Menstrual",
        icon: "heart",
        color: "#c14a4a",
        tips: [
          {
            title: "Rest & Recovery",
            description: "Your period is approaching. Prioritize rest, gentle movement, and plenty of sleep.",
          },
          {
            title: "Nourish Your Body",
            description: "Iron-rich foods, magnesium, and omega-3s can help support your body through this transition.",
          },
          {
            title: "Set Boundaries",
            description: "It's okay to say no and protect your energy. Honor what your body needs.",
          },
        ],
      },
      'insufficient-data': {
        phase: "Building Baseline",
        icon: "brain",
        color: "#9d7089",
        tips: [
          {
            title: "Consistency Matters",
            description: "Take your temperature at the same time each morning for the most accurate readings.",
          },
          {
            title: "Track Daily",
            description: "Daily tracking helps us detect your body's unique patterns and predict your period more accurately.",
          },
          {
            title: "Trust the Process",
            description: "Your body's signals are unique. We'll learn your patterns as you continue tracking.",
          },
        ],
      },
      'transition': {
        phase: "Transition Phase",
        icon: "sparkles",
        color: "#93a7d1",
        tips: [
          {
            title: "Watch for Patterns",
            description: "Your temperature may be shifting. Keep tracking to detect when ovulation occurs.",
          },
          {
            title: "Stay Consistent",
            description: "Continue taking your temperature daily to catch the temperature rise that indicates ovulation.",
          },
        ],
      },
    };

    const generalTips = [
      {
        icon: "utensils",
        title: "Nutrition for Body Literacy",
        description: "Eat a balanced diet rich in whole foods. Your body's needs may shift throughout your cycle—listen and respond.",
      },
      {
        icon: "brain",
        title: "Understand Your Patterns",
        description: "Track how you feel alongside your temperature. Over time, you'll see patterns that help you understand your body better.",
      },
      {
        icon: "heart",
        title: "Body Wisdom",
        description: "Your body communicates through temperature, energy, and mood. Learning to read these signals builds self-understanding.",
      },
    ];

    // Get tips for current detected phase
    const currentPhaseTips = phaseTips[currentPhase] || phaseTips['insufficient-data'];
    
    // Get all phase tips for display
    const allPhaseTips = Object.values(phaseTips);

    res.json({
      currentPhase: currentPhase,
      currentPhaseName: phaseInfo.phaseName,
      currentPhaseTips: currentPhaseTips,
      allPhaseTips: allPhaseTips,
      generalTips: generalTips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    readings: temperatureReadings.length
  });
});
