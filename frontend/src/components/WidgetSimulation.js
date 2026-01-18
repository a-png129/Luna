import React from 'react';
import './WidgetSimulation.css';

const phaseColors = {
  'pre-ovulation': { bg: '#93a7d1', text: '#fff' },
  'ovulation': { bg: '#93a7d1', text: '#fff' },
  'luteal': { bg: '#9d7089', text: '#fff' },
  'pre-menstrual': { bg: '#c14a4a', text: '#fff' },
  'insufficient-data': { bg: '#9d7089', text: '#fff' },
  'transition': { bg: '#93a7d1', text: '#fff' },
  'unknown': { bg: '#9d7089', text: '#fff' }
};

const phaseImages = {
  menstrual: '/images/phase-menstrual.png',
  follicular: '/images/phase-follicular.png',
  ovulation: '/images/phase-ovulation.png',
  luteal: '/images/phase-luteal.png',
  unknown: '/images/phase-unknown.png'
};

const phaseEmojis = {
  menstrual: '🔴',
  follicular: '🟢',
  ovulation: '🟠',
  luteal: '🟣',
  unknown: '⚪'
};

function WidgetSimulation({ todayData }) {
  if (!todayData) {
    return (
      <div className="widget-simulation">
        <div className="widget-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const phase = todayData.phase || 'unknown';
  const phaseInfo = phaseColors[phase] || phaseColors.unknown;

  return (
    <div className="widget-simulation">
      <h3 className="widget-title">
        <img src="/images/widget-icon.png" alt="Widget" className="inline-icon" onError={(e) => e.target.style.display = 'none'} />
        <span className="emoji-fallback">📱</span> Widget Preview
      </h3>
      <div 
        className="widget-content"
        style={{ 
          backgroundColor: phaseInfo.bg,
          color: phaseInfo.text
        }}
      >
        <div className="widget-header">
          <div className="widget-icon-wrapper">
            <img 
              src={phaseImages[phase]} 
              alt={phase}
              className="widget-icon"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="widget-emoji-fallback" style={{ display: 'none' }}>{phaseEmojis[phase]}</span>
          </div>
          <div>
            <div className="widget-phase">{todayData.phaseName || 'Building Baseline'}</div>
            {todayData.daysSinceOvulation !== null && todayData.daysSinceOvulation > 0 && (
              <div className="widget-day">{todayData.daysSinceOvulation} day{todayData.daysSinceOvulation !== 1 ? 's' : ''} past ovulation</div>
            )}
          </div>
        </div>
        
        {todayData.temperature && (
          <div className="widget-temperature">
            {todayData.temperature.toFixed(2)}°C
          </div>
        )}
        
        <div className="widget-tip">
          {todayData.tip || 'Start tracking to see insights'}
        </div>
      </div>
    </div>
  );
}

export default WidgetSimulation;
