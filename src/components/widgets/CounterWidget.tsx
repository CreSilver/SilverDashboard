"use client";

import React, { useState, useEffect } from 'react';
import { CounterWidget as CounterWidgetType, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css'; // 🚀 Přesměrováno na jednotný styl

interface CounterWidgetProps {
  widget: CounterWidgetType;
  isEditing: boolean; 
  onCloseEdit: () => void; 
  onUpdate: (
    updatedTitle: string, 
    updatedData: CounterWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

export default function CounterWidget({ widget, isEditing, onCloseEdit, onUpdate }: CounterWidgetProps) {
  const currentValue = widget.data?.currentValue ?? 0;
  const propStep = widget.data?.step ?? 1;
  const propResetValue = widget.data?.resetValue ?? 0;

  const [titleInput, setTitleInput] = useState(widget.title);
  const [stepInput, setStepInput] = useState(String(propStep));
  const [resetValueInput, setResetValueInput] = useState(String(propResetValue));
  
  // 🚀 Sjednocený klientský stav pro root parametry (výchozí 1x1)
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '1x1');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setStepInput(String(widget.data?.step ?? 1));
    setResetValueInput(String(widget.data?.resetValue ?? 0));
    setGridSizeInput(widget.gridSize || '1x1');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  const handleIncrement = () => {
    const step = Number(stepInput) || 1;
    onUpdate(widget.title, { ...widget.data, currentValue: currentValue + step }, gridSizeInput, isPinnedInput);
  };

  const handleDecrement = () => {
    const step = Number(stepInput) || 1;
    onUpdate(widget.title, { ...widget.data, currentValue: currentValue - step }, gridSizeInput, isPinnedInput);
  };

  const handleReset = () => {
    const rVal = Number(resetValueInput) || 0;
    onUpdate(widget.title, { ...widget.data, currentValue: rVal }, gridSizeInput, isPinnedInput);
    onCloseEdit();
  };

  const handleSave = () => {
    const step = Math.max(Number(stepInput) || 1, 1);
    const rVal = Number(resetValueInput) || 0;
    onUpdate(titleInput, { currentValue, step, resetValue: rVal }, gridSizeInput, isPinnedInput);
    onCloseEdit(); 
  };

  if (isEditing) {
    return (
      <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <legend style={{ display: 'none' }}>Nastavení počítadla</legend>
        
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cnt-t-${widget.id}`}>Název bloku:</label>
          <input id={`cnt-t-${widget.id}`} type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="input-stat" style={{ flex: 1 }} />
        </div>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cnt-s-${widget.id}`}>Krok (+/- o):</label>
          <input id={`cnt-s-${widget.id}`} type="number" value={stepInput} onChange={(e) => setStepInput(e.target.value)} className="input-stat" style={{ flex: 1 }} min="1" />
        </div>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cnt-r-${widget.id}`}>Resetovat na:</label>
          <input id={`cnt-r-${widget.id}`} type="number" value={resetValueInput} onChange={(e) => setResetValueInput(e.target.value)} className="input-stat" style={{ flex: 1 }} />
        </div>

        {/* 📐 Sdílené prvky pro mřížku a připínání */}
        <WidgetSizeSelector value={gridSizeInput} onChange={setGridSizeInput} />
        <WidgetPinToggle isPinned={isPinnedInput} onChange={setIsPinnedInput} />

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button onClick={handleReset} type="button" className="btn-counter-reset-inside" style={{ flex: 1 }}>
            🔄 Resetovat
          </button>
          <button 
            onClick={handleSave} 
            className="btn-secondary" 
            style={{ flex: 1, backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', margin: 0, padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            💾 Uložit pokrok
          </button>
        </div>
      </fieldset>
    );
  }

  return (
    <article className="counter-display-box">
      <div className="counter-number-zone">
        <span className="counter-main-number">{currentValue}</span>
      </div>
      <footer className="counter-actions-row">
        <button onClick={handleDecrement} className="btn-counter-click minus">−</button>
        <button onClick={handleIncrement} className="btn-counter-click plus">+</button>
      </footer>
    </article>
  );
}