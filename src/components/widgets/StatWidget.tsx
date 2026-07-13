"use client";

import React, { useState, useEffect } from 'react';
import { StatWidget as StatWidgetType, ChartItem } from '../../types/dashboard';
import './statWidget.css';

interface StatWidgetProps {
  widget: StatWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate: (updatedTitle: string, updatedData: StatWidgetType['data']) => void;
}

function calculateChartMetrics(items: ChartItem[]) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  return { total, max };
}

function computePieChartStyle(items: ChartItem[], totalValue: number) {
  if (totalValue <= 0) return { background: '#35373c' };
  let accumulatedPercent = 0;
  const parts = items.map((item) => {
    const percent = (Number(item.value || 0) / totalValue) * 100;
    const start = accumulatedPercent; accumulatedPercent += percent;
    return `${item.color} ${start}% ${accumulatedPercent}%`;
  });
  return { background: `conic-gradient(${parts.join(', ')})` };
}

interface EditFormProps {
  widgetId: string; title: string; items: ChartItem[]; chartType: 'bar' | 'pie'; isPinned: boolean;
  onTitleChange: (val: string) => void; onItemChange: (id: string, key: keyof ChartItem, val: string | number) => void;
  onRemoveItem: (id: string) => void; onAddItem: () => void; onChartTypeChange: (type: 'bar' | 'pie') => void; onPinnedChange: (val: boolean) => void; onSave: () => void;
}
function StatEditForm({
  widgetId, title, items, chartType, isPinned,
  onTitleChange, onItemChange, onRemoveItem, onAddItem, onChartTypeChange, onPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Editace grafu</legend>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`title-${widgetId}`}>Název grafu:</label>
        <input id={`title-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '110px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {items.map((item) => (
          <div key={item.id} className="form-row">
            <input type="text" value={item.label} onChange={(e) => onItemChange(item.id, 'label', e.target.value)} placeholder="Název" className="input-stat" style={{ flex: 2 }} />
            <input type="number" value={item.value} onChange={(e) => onItemChange(item.id, 'value', Number(e.target.value))} placeholder="Stav" className="input-stat" style={{ flex: 1 }} />
            <input type="color" value={item.color} onChange={(e) => onItemChange(item.id, 'color', e.target.value)} className="input-color" />
            <button onClick={() => onRemoveItem(item.id)} className="btn-secondary" style={{ color: '#da8589' }}>❌</button>
          </div>
        ))}
      </div>

      <button onClick={onAddItem} className="btn-secondary" style={{ width: '100%', padding: '0.4rem' }}>➕ Přidat hodnotu</button>

      {/* 🚀 Volba typu grafu přesunuta přirozeně sem jako nastavení */}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
        <button type="button" onClick={() => onChartTypeChange('bar')} className="btn-secondary" style={{ flex: 1, borderColor: chartType === 'bar' ? '#34d399' : '', color: chartType === 'bar' ? '#34d399' : '' }}>📊 Sloupcový</button>
        <button type="button" onClick={() => onChartTypeChange('pie')} className="btn-secondary" style={{ flex: 1, borderColor: chartType === 'pie' ? '#34d399' : '', color: chartType === 'pie' ? '#34d399' : '' }}>🍕 Koláčový</button>
      </div>

      <label className="pinned-label">
        <input type="checkbox" checked={isPinned} onChange={(e) => onPinnedChange(e.target.checked)} />
        <span>📌 Připnout na hlavní přehled</span>
      </label>

      {/* 🚀 Sjednocené zelené tlačítko vespod */}
      <button 
        onClick={onSave} 
        className="btn-secondary"
        style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.25rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        💾 Uložit pokrok
      </button>
    </fieldset>
  );
}

export default function StatWidget({ widget, isEditing, onCloseEdit, onUpdate }: StatWidgetProps) {
  const [titleInput, setTitleInput] = useState(widget.title);
  const [chartType, setChartType] = useState(widget.data?.chartType || 'bar');
  const [items, setItems] = useState<ChartItem[]>(widget.data?.items || []);
  const [isPinned, setIsPinned] = useState(widget.data?.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setChartType(widget.data?.chartType || 'bar');
    setItems(widget.data?.items || []);
    setIsPinned(widget.data?.isPinnedToSummary || false);
  }, [widget]);

  const { total: totalValue, max: maxValue } = calculateChartMetrics(items);

  const handleSave = () => {
    onUpdate(titleInput, { chartType, items, isPinnedToSummary: isPinned });
    onCloseEdit();
  };

  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), label: `Prvek ${items.length + 1}`, value: 0, color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}` }]);
  };

  if (isEditing) {
    return (
      <StatEditForm
        widgetId={widget.id} title={titleInput} items={items} chartType={chartType} isPinned={isPinned}
        onTitleChange={setTitleInput} onItemChange={(id, key, val) => setItems(items.map(it => it.id === id ? { ...it, [key]: val } : it))}
        onRemoveItem={(id) => setItems(items.filter(it => it.id !== id))} onAddItem={handleAddItem} onChartTypeChange={setChartType} onPinnedChange={setIsPinned} onSave={handleSave}
      />
    );
  }

  return (
    <article className="chart-display-box">
      {items.length === 0 ? <p style={{ color: '#666', fontSize: '0.9rem' }}>Žádná data.</p> : 
        chartType === 'bar' ? (
          <div className="bar-chart-container">
            {items.map(item => <div key={item.id} className="bar-wrapper"><span className="bar-value">{item.value}</span><div className="bar-pill" style={{ height: `${(Number(item.value || 0) / maxValue) * 100}%`, backgroundColor: item.color }} /></div>)}
          </div>
        ) : <div className="pie-chart-circle" style={computePieChartStyle(items, totalValue)} />}
      <footer className="chart-legend">
        {items.map(item => <div key={item.id} className="legend-item"><span className="legend-color-dot" style={{ backgroundColor: item.color }} /><span>{item.label} ({totalValue > 0 ? ((Number(item.value || 0) / totalValue) * 100).toFixed(0) : 0}%)</span></div>)}
      </footer>
    </article>
  );
}