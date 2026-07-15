"use client";

import React, { useState, useEffect } from 'react';
import { TextWidget as TextWidgetType, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css'; // 🚀 Přesunuto pod jednotný soubor widgets.css

interface TextWidgetProps {
  widget: TextWidgetType;
  isEditing: boolean; 
  onCloseEdit: () => void;
  onUpdate?: (
    updatedTitle: string, 
    updatedData: TextWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

interface EditFormProps {
  widgetId: string; 
  title: string; 
  text: string; 
  gridSize: WidgetGridSize; 
  isPinned: boolean;
  onTitleChange: (val: string) => void; 
  onTextChange: (val: string) => void; 
  onGridSizeChange: (val: WidgetGridSize) => void; 
  onIsPinnedChange: (val: boolean) => void;
  onSave: () => void;
}

function TextEditForm({ 
  widgetId, title, text, gridSize, isPinned, 
  onTitleChange, onTextChange, onGridSizeChange, onIsPinnedChange, onSave 
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
      <legend style={{ display: 'none' }}>Úprava textu poznámky</legend>
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`text-t-${widgetId}`}>Název blicks:</label>
        <input id={`text-t-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>
      <textarea value={text} onChange={(e) => onTextChange(e.target.value)} className="textarea-text" style={{ flex: 1, minHeight: '120px' }} placeholder="Sem napiš vzkaz..." />
      
      {/* 📐 UNIFIKOVANÉ ČÁSTI: Změna mřížky (16 kombinací) a připínání */}
      <WidgetSizeSelector value={gridSize} onChange={onGridSizeChange} />
      <WidgetPinToggle isPinned={isPinned} onChange={onIsPinnedChange} />

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
  
  // 🚀 Zavedení klientského stavu pro root parametry (výchozí 2x1)
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x1');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setTextInput(widget.data?.text || '');
    setGridSizeInput(widget.gridSize || '2x1');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(
        titleInput, 
        { text: textInput }, 
        gridSizeInput, 
        isPinnedInput
      );
    }
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <TextEditForm
        widgetId={widget.id} title={titleInput} text={textInput} gridSize={gridSizeInput} isPinned={isPinnedInput}
        onTitleChange={setTitleInput} onTextChange={setTextInput} onGridSizeChange={setGridSizeInput} onIsPinnedChange={setIsPinnedInput} onSave={handleSave}
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