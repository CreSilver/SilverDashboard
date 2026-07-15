"use client";

import React, { useState, useEffect } from 'react';
import { CountUpWidget as CountUpWidgetType, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css'; // 🚀 Přesměrováno na jednotný styl

interface CountUpWidgetProps {
  widget: CountUpWidgetType;
  isEditing: boolean;
  onCloseEdit: () => void;
  onUpdate?: (
    updatedTitle: string, 
    updatedData: CountUpWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

function calculateTimePassed(startDate: string) {
  if (!startDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const difference = +new Date() - +new Date(startDate);
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  };
}

function formatNum(num: number): string {
  return String(num).padStart(2, '0');
}

export default function CountUpWidget({ widget, isEditing, onCloseEdit, onUpdate }: CountUpWidgetProps) {
  const propDate = widget.data?.startDate || '';
  const propLabel = widget.data?.label || '';

  const [titleInput, setTitleInput] = useState(widget.title);
  const [dateInput, setDateInput] = useState(propDate);
  const [labelInput, setLabelInput] = useState(propLabel);
  
  // 🚀 Sjednocený klientský stav pro root parametry (výchozí 2x1)
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x1');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  const [timePassed, setTimePassed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTitleInput(widget.title);
    setDateInput(widget.data?.startDate || '');
    setLabelInput(widget.data?.label || '');
    setGridSizeInput(widget.gridSize || '2x1');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  useEffect(() => {
    if (!propDate) return;
    const tick = () => setTimePassed(calculateTimePassed(propDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [propDate]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(
        titleInput, 
        { startDate: dateInput, label: labelInput }, 
        gridSizeInput, 
        isPinnedInput
      );
    }
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <legend style={{ display: 'none' }}>Nastavení milníku</legend>
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cup-t-${widget.id}`}>Název milníku:</label>
          <input id={`cup-t-${widget.id}`} type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="input-stat" style={{ flex: 1 }} />
        </div>
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cup-d-${widget.id}`}>Počáteční datum:</label>
          <input id={`cup-d-${widget.id}`} type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="input-datetime" style={{ flex: 1 }} />
        </div>
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`cup-l-${widget.id}`}>Mini podtext:</label>
          <input id={`cup-l-${widget.id}`} type="text" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} className="input-stat" style={{ flex: 1 }} placeholder="Např. Od spuštění produkce..." />
        </div>

        {/* 📐 Sdílené prvky pro mřížku a připínání */}
        <WidgetSizeSelector value={gridSizeInput} onChange={setGridSizeInput} />
        <WidgetPinToggle isPinned={isPinnedInput} onChange={setIsPinnedInput} />

        <button onClick={handleSave} className="btn-secondary" style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}>
          💾 Uložit pokrok
        </button>
      </fieldset>
    );
  }

  if (!propDate) {
    return <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem', margin: 0 }}>Není nastaveno datum. Klikni na ozubené kolečko.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <article className="countdown-display">
        <div className="time-segment"><span className="time-number">{formatNum(timePassed.days)}</span><span className="time-label">Dny</span></div>
        <div className="time-separator">:</div>
        <div className="time-segment"><span className="time-number">{formatNum(timePassed.hours)}</span><span className="time-label">Hod</span></div>
        <div className="time-separator">:</div>
        <div className="time-segment"><span className="time-number">{formatNum(timePassed.minutes)}</span><span className="time-label">Min</span></div>
        <div className="time-separator">:</div>
        <div className="time-segment"><span className="time-number">{formatNum(timePassed.seconds)}</span><span className="time-label">Sec</span></div>
      </article>
      {propLabel && <footer style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', marginTop: 'auto' }}>{propLabel}</footer>}
    </div>
  );
}