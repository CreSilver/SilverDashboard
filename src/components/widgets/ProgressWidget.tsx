"use client";

import React, { useState, useEffect } from 'react';
import { ProgressWidget as ProgressWidgetType } from '../../types/dashboard';
import './progressWidget.css';

interface ProgressWidgetProps {
  widget: ProgressWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate?: (updatedTitle: string, updatedData: ProgressWidgetType['data']) => void;
}

function calculatePercentage(current: number, target: number): number {
  return Math.round((current / Math.max(target, 1)) * 100);
}

function computeRingStyle(color: string, percentage: number) {
  const capped = Math.min(percentage, 100);
  return { background: `conic-gradient(${color} 0% ${capped}%, rgba(255, 255, 255, 0.03) ${capped}% 100%)` };
}

interface EditFormProps {
  widgetId: string; title: string; current: string; target: string; unit: string; color: string; isPinned: boolean;
  onTitleChange: (val: string) => void; onCurrentChange: (val: string) => void; onTargetChange: (val: string) => void;
  onUnitChange: (val: string) => void; onColorChange: (val: string) => void; onPinnedChange: (val: boolean) => void; onSave: () => void;
}
function ProgressEditForm({
  widgetId, title, current, target, unit, color, isPinned,
  onTitleChange, onCurrentChange, onTargetChange, onUnitChange, onColorChange, onPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Nastavení pokroku</legend>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`prog-t-${widgetId}`}>Název:</label>
        <input id={`prog-t-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`prog-c-${widgetId}`}>Stav:</label>
        <input id={`prog-c-${widgetId}`} type="number" value={current} onChange={(e) => onCurrentChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`prog-g-${widgetId}`}>Cíl:</label>
        <input id={`prog-g-${widgetId}`} type="number" value={target} onChange={(e) => onTargetChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`prog-u-${widgetId}`}>Jednotka:</label>
        <input id={`prog-u-${widgetId}`} type="text" value={unit} onChange={(e) => onUnitChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`prog-col-${widgetId}`}>Barva:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <input id={`prog-col-${widgetId}`} type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="input-color" />
          <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#64748b' }}>{color.toUpperCase()}</span>
        </div>
      </div>
      <label className="pinned-label">
        <input type="checkbox" checked={isPinned} onChange={(e) => onPinnedChange(e.target.checked)} />
        <span>📌 Připnout na hlavní přehled</span>
      </label>
      {/* 🚀 Sjednocené zelené tlačítko vespod */}
      <button 
        onClick={onSave} 
        className="btn-secondary"
        style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        💾 Uložit pokrok
      </button>
    </fieldset>
  );
}

export default function ProgressWidget({ widget, isEditing, onCloseEdit, onUpdate }: ProgressWidgetProps) {
  const [titleInput, setTitleInput] = useState(widget.title);
  const [currentInput, setCurrentInput] = useState(String(widget.data?.currentValue || 0));
  const [targetInput, setTargetInput] = useState(String(widget.data?.targetValue || 100));
  const [unitInput, setUnitInput] = useState(widget.data?.unit || '');
  const [isPinned, setIsPinned] = useState(widget.data?.isPinnedToSummary || false);
  const [colorInput, setColorInput] = useState((widget.data as any)?.color || '#34d399');

  useEffect(() => {
    setTitleInput(widget.title);
    setCurrentInput(String(widget.data?.currentValue || 0));
    setTargetInput(String(widget.data?.targetValue || 100));
    setUnitInput(widget.data?.unit || '');
    setIsPinned(widget.data?.isPinnedToSummary || false);
    setColorInput((widget.data as any)?.color || '#34d399');
  }, [widget]);

  const current = Number(currentInput) || 0;
  const target = Math.max(Number(targetInput) || 100, 1);
  const percentage = calculatePercentage(current, target);

  const handleSave = () => {
    if (onUpdate) onUpdate(titleInput, { currentValue: current, targetValue: target, unit: unitInput, isPinnedToSummary: isPinned, color: colorInput } as any);
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <ProgressEditForm
        widgetId={widget.id} title={titleInput} current={currentInput} target={targetInput} unit={unitInput} color={colorInput} isPinned={isPinned}
        onTitleChange={setTitleInput} onCurrentChange={setCurrentInput} onTargetChange={setTargetInput} onUnitChange={setUnitInput} onColorChange={setColorInput} onPinnedChange={setIsPinned} onSave={handleSave}
      />
    );
  }

  return (
    <article className="progress-chart-box">
      <div className="progress-ring" style={computeRingStyle(colorInput, percentage)}>
        <div className="progress-ring-center">
          <span className="progress-percentage" style={{ color: colorInput, textShadow: `0 0 15px ${colorInput}4d` }}>{percentage}%</span>
          <span className="progress-fraction">{current} z {target} {widget.data?.unit}</span>
        </div>
      </div>
    </article>
  );
}