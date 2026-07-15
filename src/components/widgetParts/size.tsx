"use client";

import React from 'react';
import { WidgetGridSize } from '../../types/dashboard';
import './parts.css';

interface WidgetSizeSelectorProps {
  value?: WidgetGridSize;
  onChange: (newSize: WidgetGridSize) => void;
  label?: string;
}

export function WidgetSizeSelector({ 
  value = '2x2', 
  onChange, 
  label = 'Rozměry na ploše (Šířka × Výška):' 
}: WidgetSizeSelectorProps) {
  
  // Rozložíme např. '3x2' na šířku '3' a výšku '2'
  const [w, h] = value.split('x');
  const width = w || '2';
  const height = h || '2';

  const handleWidthChange = (newWidth: string) => {
    // Složíme zpět do formátu pro dashboard.ts
    onChange(`${newWidth}x${height}` as WidgetGridSize);
  };

  const handleHeightChange = (newHeight: string) => {
    // Složíme zpět do formátu pro dashboard.ts
    onChange(`${width}x${newHeight}` as WidgetGridSize);
  };

  return (
    <div className="widget-part-row">
      <label className="widget-part-label">{label}</label>
      <div className="widget-size-selectors-container">
        
        {/* Výběr šířky */}
        <div className="widget-size-select-wrapper">
          <select
            aria-label="Šířka prvku"
            value={width}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="widget-part-select"
          >
            <option value="1">1 sloupec</option>
            <option value="2">2 sloupce</option>
            <option value="3">3 sloupce</option>
            <option value="4">4 sloupce</option>
          </select>
        </div>

        <span className="widget-size-separator">×</span>

        {/* Výběr výšky */}
        <div className="widget-size-select-wrapper">
          <select
            aria-label="Výška prvku"
            value={height}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="widget-part-select"
          >
            <option value="1">1 řádek</option>
            <option value="2">2 řádky</option>
            <option value="3">3 řádky</option>
            <option value="4">4 řádky</option>
          </select>
        </div>

      </div>
    </div>
  );
}