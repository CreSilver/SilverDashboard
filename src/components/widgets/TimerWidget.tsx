"use client";

import React, { useState, useEffect } from 'react';
import { TimerWidget as TimerWidgetType } from '../../types/dashboard';
import './timerWidget.css';

interface TimerWidgetProps {
  widget: TimerWidgetType;
  isEditing: boolean; // 🚀 Přijímáme z nadřazené karty
  onCloseEdit: () => void; // 🚀 Zavření editačního režimu
  onUpdate?: (updatedTitle: string, updatedData: TimerWidgetType['data']) => void;
}

function calculateTimeLeft(targetDate: string) {
  if (!targetDate) {
    return { timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }, isOver: true, isUrgent: false };
  }
  const difference = +new Date(targetDate) - +new Date();
  if (difference <= 0) {
    return { timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 }, isOver: true, isUrgent: false };
  }
  return {
    timeLeft: {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    },
    isOver: false,
    isUrgent: difference < 1000 * 60 * 60 * 24
  };
}

function formatNum(num: number): string {
  return String(num).padStart(2, '0');
}

export default function TimerWidget({ widget, isEditing, onCloseEdit, onUpdate }: TimerWidgetProps) {
  const propDate = widget.data?.targetDate || '';
  const propLabel = widget.data?.label || '';

  const [titleInput, setTitleInput] = useState(widget.title);
  const [dateInput, setDateInput] = useState(propDate);
  const [labelInput, setLabelInput] = useState(propLabel);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isOver, setIsOver] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    setTitleInput(widget.title);
    setDateInput(widget.data?.targetDate || '');
    setLabelInput(widget.data?.label || '');
  }, [widget]);

  useEffect(() => {
    if (!propDate) return;
    const tick = () => {
      const metrics = calculateTimeLeft(propDate);
      setTimeLeft(metrics.timeLeft);
      setIsOver(metrics.isOver);
      setIsUrgent(metrics.isUrgent);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [propDate]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(titleInput, { targetDate: dateInput, label: labelInput });
    }
    onCloseEdit(); // 🚀 Oznámíme kartě, že ukládání skončilo
  };

  if (isEditing) {
    return (
      <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <legend style={{ display: 'none' }}>Nastavení cílového času</legend>
        
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`time-t-${widget.id}`}>Název milníku:</label>
          <input
            id={`time-t-${widget.id}`}
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="input-stat"
            style={{ flex: 1 }}
          />
        </div>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`time-d-${widget.id}`}>Cílový čas:</label>
          <input
            id={`time-d-${widget.id}`}
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="input-datetime"
            style={{ flex: 1 }}
          />
        </div>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`time-l-${widget.id}`}>Mini podtext:</label>
          <input
            id={`time-l-${widget.id}`}
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            className="input-stat"
            style={{ flex: 1 }}
            placeholder="Např. Spuštění produkce..."
          />
        </div>

        {/* 🚀 Tlačítko se přesunulo natvrdo DOLŮ s tvým přesným vzhledem */}
        <button 
          onClick={handleSave} 
          className="btn-secondary"
          style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          💾 Uložit pokrok
        </button>
      </fieldset>
    );
  }

  return (
    <>
      <article className={`countdown-display ${isUrgent ? 'timer-urgent' : ''}`}>
        {isOver ? (
          <div className="timer-message">🎉 Dosaženo stanoveného cíle!</div>
        ) : (
          <>
            <div className="time-segment"><span className="time-number">{formatNum(timeLeft.days)}</span><span className="time-label">Dny</span></div>
            <div className="time-separator">:</div>
            <div className="time-segment"><span className="time-number">{formatNum(timeLeft.hours)}</span><span className="time-label">Hod</span></div>
            <div className="time-separator">:</div>
            <div className="time-segment"><span className="time-number">{formatNum(timeLeft.minutes)}</span><span className="time-label">Min</span></div>
            <div className="time-separator">:</div>
            <div className="time-segment"><span className="time-number">{formatNum(timeLeft.seconds)}</span><span className="time-label">Sec</span></div>
          </>
        )}
      </article>
      {propLabel && (
        <footer style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
          {propLabel}
        </footer>
      )}
    </>
  );
}