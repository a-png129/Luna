import React from 'react';
import './BottomNav.css';

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "home", icon: "/images/stars.png"},
    { id: "tips", icon: "/images/bun.png"},
    { id: "settings", icon: "/images/hat.png"},
  ];

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-container">
        <div className="bottom-nav-content">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={isActive ? 'active' : ''}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={tab.icon} 
                  alt={tab.id}
                  className="nav-icon-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BottomNav;
