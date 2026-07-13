"use client";

import React, { useState, useEffect } from 'react';
import { TextWidget as TextWidgetType } from '../../types/dashboard';
import './textWidget.css';

interface TextWidgetProps {
  widget: TextWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate?: (updatedTitle: string, updatedData: TextWidgetType['data']) => void;
}

interface EditFormProps {
  widgetId: string; 
  title: string; 
  text: string; 
  gridSize: string; // 🚀 Přidáno pro řízení rozměru formuláře
  onTitleChange: (val: string) => void; 
  onTextChange: (val: string) => void; 
  onGridSizeChange: (val: any) => void; // 🚀 Callback pro změnu rozměru
  onSave: () => void;
}

function TextEditForm({ widgetId, title, text, gridSize, onTitleChange, onTextChange, onGridSizeChange, onSave }: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
      <legend style={{ display: 'none' }}>Úprava textu poznámky</legend>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`text-t-${widgetId}`}>Název blicks:</label>
        <input id={`text-t-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <textarea value={text} onChange={(e) => onTextChange(e.target.value)} className="textarea-text" style={{ flex: 1, minHeight: '120px' }} placeholder="Sem napiš vzkaz..." />
      
      {/* 🚀 NOVINKA: Výběr velikosti textového boxu v mřížce */}
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`text-g-${widgetId}`}>Rozměry na ploše:</label>
        <select 
          id={`text-g-${widgetId}`} 
          value={gridSize} 
          onChange={(e) => onGridSizeChange(e.target.value as any)} 
          className="input-stat" 
          style={{ 
            flex: 1, 
            background: '#1a1a1a', 
            color: '#dbdee1', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '6px', 
            padding: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <option value="1x1">Malý čtverec (1x1)</option>
          <option value="2x1">Široká nudle (2x1)</option>
          <option value="1x2">Vysoký sloupec (1x2)</option>
          <option value="2x2">Standardní kostka (2x2)</option>
          <option value="3x2">Velký přehled (3x2)</option>
          <option value="4x2">Královská velikost (4x2)</option>
        </select>
      </div>

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

export default function TextWidget({ widget, isEditing, onCloseEdit, onUpdate }: TextWidgetProps) {
  const [titleInput, setTitleInput] = useState(widget.title);
  const [textInput, setTextInput] = useState(widget.data?.text || '');
  // 🚀 Zaveden klientský stav s výchozí hodnotou '2x1' pro starší nepopsané poznámky
  const [gridSizeInput, setGridSizeInput] = useState(widget.data?.gridSize || '2x1');

  useEffect(() => {
    setTitleInput(widget.title);
    setTextInput(widget.data?.text || '');
    setGridSizeInput(widget.data?.gridSize || '2x1');
  }, [widget]);

  const handleSave = () => {
    // 🚀 Při uložení pošleme zpět do workspace jak text, tak novou velikost
    if (onUpdate) onUpdate(titleInput, { text: textInput, gridSize: gridSizeInput });
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <TextEditForm
        widgetId={widget.id} title={titleInput} text={textInput} gridSize={gridSizeInput}
        onTitleChange={setTitleInput} onTextChange={setTextInput} onGridSizeChange={setGridSizeInput} onSave={handleSave}
      />
    );
  }

  return (
    <article className="text-preview-box">
      {widget.data?.text ? <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{widget.data.text}</p> : 
        <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>Tento textový blok je zatím prázdný.</p>}
    </article>
  );
}