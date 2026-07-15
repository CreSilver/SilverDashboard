"use client";

import React from 'react';
import './parts.css';

interface WidgetPinToggleProps {
  isPinned?: boolean;
  onChange: (pinned: boolean) => void;
  label?: string;
}

export function WidgetPinToggle({ 
  isPinned = false, 
  onChange, 
  label = 'Připnout klíčovou metriku na Hlavní přehled:' 
}: WidgetPinToggleProps) {
  return (
    <div className="widget-part-row align-center">
      <span className="widget-part-label">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!isPinned)}
        className={`widget-pin-toggle-btn ${isPinned ? 'pinned-active' : ''}`}
        title={isPinned ? 'Odšpendlit z Hlavního přehledu' : 'Přišpendlit na Hlavní přehled'}
      >
        <span className="pin-icon">{isPinned ? '📍' : '📌'}</span>
        <span className="pin-text">{isPinned ? 'Připnuto' : 'Připnout'}</span>
      </button>
    </div>
  );
}