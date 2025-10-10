import React from 'react';

interface TabNavigationProps {
  activeTab: 'sales' | 'users';
  onTabChange: (tab: 'sales' | 'users') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="reports-page-tabs">
      <div className="reports-page-tab-list">
        <button
          onClick={() => onTabChange('sales')}
          className={`reports-page-tab ${activeTab === 'sales' ? 'active' : ''}`}
        >
          Sales Overview
        </button>
        <button
          onClick={() => onTabChange('users')}
          className={`reports-page-tab ${activeTab === 'users' ? 'active' : ''}`}
        >
          User Purchase Analytics
        </button>
      </div>
    </div>
  );
}