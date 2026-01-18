import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TipsPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const iconMap = {
  heart: '❤️',
  sparkles: '✨',
  activity: '🏃',
  brain: '🧠',
  utensils: '🍽️'
};

function TipsPage() {
  const [tipsData, setTipsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tips`);
      setTipsData(response.data);
    } catch (err) {
      console.error('Error fetching tips:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tips-page">
        <div className="loading">Loading tips...</div>
      </div>
    );
  }

  if (!tipsData) {
    return (
      <div className="tips-page">
        <div className="loading">No tips available</div>
      </div>
    );
  }

  return (
    <div className="tips-page">
      {/* Header */}
      <div className="tips-header">
        <div className="header-icons-group">
          <img 
            src="/images/tips-icon.png" 
            alt="Book" 
            className="header-icon tips-icon-img"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <span className="tips-icon-fallback" style={{ display: 'none' }}>📖</span>
          
          <div className="mascot-circle-small">
            <img 
              src="/images/mascot.png" 
              alt="Luna Mascot" 
              className="mascot-image-small"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
            />
            <span className="mascot-emoji-fallback-small" style={{ display: 'none' }}>🦘</span>
          </div>
        </div>
        <h1 className="tips-title">Body Literacy & Insights</h1>
        <p className="tips-subtitle">Understand your body's signals</p>
      </div>

      {/* Decorative line */}
      <div className="decorative-line">
        <div className="gradient-line"></div>
      </div>

      {/* Current Phase Tips (Highlighted) */}
      {tipsData.currentPhaseTips && (
        <div className="phase-tips-card current-phase-card" style={{ borderColor: tipsData.currentPhaseTips.color, borderWidth: '2px' }}>
          <div className="phase-header">
            <div 
              className="phase-icon-circle"
              style={{ backgroundColor: `${tipsData.currentPhaseTips.color}20` }}
            >
              <span className="phase-icon" style={{ color: tipsData.currentPhaseTips.color }}>
                {iconMap[tipsData.currentPhaseTips.icon] || '💡'}
              </span>
            </div>
            <div>
              <h2 className="phase-title">{tipsData.currentPhaseName || tipsData.currentPhaseTips.phase}</h2>
              <p className="phase-subtitle" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your current detected phase
              </p>
            </div>
          </div>

          <div className="tips-list">
            {tipsData.currentPhaseTips.tips.map((tip, index) => (
              <div 
                key={index} 
                className="tip-item"
                style={{ borderLeftColor: tipsData.currentPhaseTips.color }}
              >
                <h3 className="tip-title">{tip.title}</h3>
                <p className="tip-description">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Phase Tips */}
      <div className="all-phases-section">
        <h2 className="section-title" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '16px', marginTop: '8px' }}>
          All Phases
        </h2>
        {tipsData.allPhaseTips.map((phaseInfo) => (
          <div key={phaseInfo.phase} className="phase-tips-card">
            <div className="phase-header">
              <div 
                className="phase-icon-circle"
                style={{ backgroundColor: `${phaseInfo.color}20` }}
              >
                <span className="phase-icon" style={{ color: phaseInfo.color }}>
                  {iconMap[phaseInfo.icon] || '💡'}
                </span>
              </div>
              <h2 className="phase-title">{phaseInfo.phase}</h2>
            </div>

            <div className="tips-list">
              {phaseInfo.tips.map((tip, index) => (
                <div 
                  key={index} 
                  className="tip-item"
                  style={{ borderLeftColor: phaseInfo.color }}
                >
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className="tip-description">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Body Literacy Tips */}
      <div className="general-tips-card">
        <h2 className="general-tips-title">Body Literacy & Self-Understanding</h2>

        <div className="general-tips-list">
          {tipsData.generalTips.map((tip, index) => (
            <div key={index} className="general-tip-item">
              <span className="general-tip-icon">
                {iconMap[tip.icon] || '💡'}
              </span>
              <div className="general-tip-content">
                <h3 className="general-tip-title">{tip.title}</h3>
                <p className="general-tip-description">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-card">
        <p className="disclaimer-text">
          <strong>Note:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with your healthcare provider for personalized guidance.
        </p>
      </div>

      {/* Decorative sparkles */}
      <div className="decorative-sparkles">
        <span className="sparkle">✨</span>
        <span className="sparkle small">✨</span>
        <span className="sparkle">✨</span>
      </div>
    </div>
  );
}

export default TipsPage;
