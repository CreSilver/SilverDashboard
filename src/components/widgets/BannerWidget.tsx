"use client";

import React, { useState, useEffect } from 'react';
import { BannerWidget as BannerWidgetType, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css'; // 🚀 Přesměrováno na jednotný styl

interface BannerWidgetProps {
  widget: BannerWidgetType;
  isEditing: boolean; 
  onCloseEdit: () => void;
  onUpdate?: (
    updatedTitle: string, 
    updatedData: BannerWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

// 🚀 DYNAMICKÝ LIMIT: Povolí 35 znaků na každý sloupec šířky (1x až 4x)
function getGridMaxLength(size: string): number {
  const [w] = size.split('x');
  const width = Number(w) || 2;
  return width * 35;
}

function computeBannerStyle(bgColor: string, textColor: string) {
  return {
    backgroundColor: `${bgColor}1f`,
    border: `1px solid ${bgColor}55`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.25), 0 0 20px ${bgColor}10`,
    color: textColor,
  };
}

interface EditFormProps {
  widgetId: string; title: string; text: string; bgColor: string; textColor: string;
  gridSize: WidgetGridSize; isPinned: boolean; maxLength: number;
  onTitleChange: (val: string) => void; onTextChange: (val: string) => void;
  onBgColorChange: (val: string) => void; onTextColorChange: (val: string) => void;
  onGridSizeChange: (val: WidgetGridSize) => void; onIsPinnedChange: (val: boolean) => void; onSave: () => void;
}
function BannerEditForm({
  widgetId, title, text, bgColor, textColor, gridSize, isPinned, maxLength,
  onTitleChange, onTextChange, onBgColorChange, onTextColorChange, onGridSizeChange, onIsPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Nastavení banneru</legend>
      
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`bn-t-${widgetId}`}>Název bloku:</label>
        <input id={`bn-t-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>

      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`bn-txt-${widgetId}`}>Text zprávy:</label>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.25rem' }}>
          <input
            id={`bn-txt-${widgetId}`}
            type="text"
            value={text}
            maxLength={maxLength}
            onChange={(e) => onTextChange(e.target.value)}
            className="input-stat"
            placeholder="Napiš velký vzkaz..."
          />
          <span className="char-counter">{text.length} / {maxLength} znaků max</span>
        </div>
      </div>

      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`bn-bg-${widgetId}`}>Pozadí:</label>
        <input id={`bn-bg-${widgetId}`} type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="input-color" />
        <label className="label-stat" htmlFor={`bn-txc-${widgetId}`} style={{ minWidth: 'auto', marginLeft: '1rem' }}>Text:</label>
        <input id={`bn-txc-${widgetId}`} type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="input-color" />
      </div>

      {/* 📐 Znovupoužitelné části pro mřížku a připnutí */}
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

function BannerDisplay({ text, bgColor, textColor }: { text: string; bgColor: string; textColor: string }) {
  const bannerStyle = computeBannerStyle(bgColor, textColor);
  return (
    <article className="banner-display-box" style={bannerStyle}>
      <p className="banner-main-text">{text}</p>
    </article>
  );
}

export default function BannerWidget({ widget, isEditing, onCloseEdit, onUpdate }: BannerWidgetProps) {
  const [titleInput, setTitleInput] = useState(widget.title);
  const [textInput, setTextInput] = useState(widget.data?.text || 'Tvůj velký text...');
  const [bgColorInput, setBgColorInput] = useState(widget.data?.bgColor || '#10b981');
  const [textColorInput, setTextColorInput] = useState(widget.data?.textColor || '#ffffff');
  
  // 🚀 Sjednocený klientský stav pro root parametry (výchozí 2x1)
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x1');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setTextInput(widget.data?.text || 'Tvůj velký text...');
    setBgColorInput(widget.data?.bgColor || '#10b981');
    setTextColorInput(widget.data?.textColor || '#ffffff');
    setGridSizeInput(widget.gridSize || '2x1');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  const currentMaxLength = getGridMaxLength(gridSizeInput);

  useEffect(() => {
    if (textInput.length > currentMaxLength) {
      setTextInput(textInput.substring(0, currentMaxLength));
    }
  }, [gridSizeInput, currentMaxLength, textInput]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(
        titleInput, 
        { text: textInput, bgColor: bgColorInput, textColor: textColorInput },
        gridSizeInput,
        isPinnedInput
      );
    }
    onCloseEdit();
  };

  return (
    <div className="banner-widget-container">
      {isEditing ? (
        <BannerEditForm
          widgetId={widget.id} title={titleInput} text={textInput} bgColor={bgColorInput} textColor={textColorInput}
          gridSize={gridSizeInput} isPinned={isPinnedInput} maxLength={currentMaxLength}
          onTitleChange={setTitleInput} onTextChange={setTextInput} onBgColorChange={setBgColorInput} onTextColorChange={setTextColorInput}
          onGridSizeChange={setGridSizeInput} onIsPinnedChange={setIsPinnedInput} onSave={handleSave}
        />
      ) : (
        <BannerDisplay text={textInput} bgColor={bgColorInput} textColor={textColorInput} />
      )}
    </div>
  );
}