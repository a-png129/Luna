export const temperatureReadings = [];

// User settings (for MVP - replace with database in production)
export const userSettings = {
  profile: {
    name: 'Luna User',
    email: 'luna@example.com'
  },
  notifications: {
    periodReminders: true,
    dailyLogs: true,
    ovulationWindow: false
  },
  preferences: {
    temperatureUnit: 'Celsius'
  },
  device: {
    connected: false,
    deviceName: null
  }
};
