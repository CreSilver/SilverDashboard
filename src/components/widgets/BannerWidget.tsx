"use client";

import { useState, useEffect } from 'react';
import { BannerWidget as BannerWidgetType } from '../../types/dashboard';
import './bannerWidget.css';

interface BannerWidgetProps {
  widget: BannerWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate?: (updatedTitle: string, updatedData: BannerWidgetType['data']) => void;
}

function getGridMaxLength(size: string): number {
  if (size === '1x1') return 35;
  if (size === '2x1' || size === '1x2') return 70;
  return 140;
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
  widgetId: string;
  title: string;
  text: string;
  bgColor: string;
  textColor: string;
  gridSize: string;
  isPinned: boolean;
  maxLength: number;
  onTitleChange: (val: string) => void;
  onTextChange: (val: string) => void;
  onGridSizeChange: (val: any) => void;
  onBgColorChange: (val: string) => void;
  onTextColorChange: (val: string) => void;
  onPinnedChange: (val: boolean) => void;
  onSave: () => void; // 🚀 Callback pro uložení
}
function BannerEditForm({
  widgetId, title, text, bgColor, textColor, gridSize, isPinned, maxLength,
  onTitleChange, onTextChange, onGridSizeChange, onBgColorChange, onTextColorChange, onPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Nastavení banneru</legend>
      
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`bn-t-${widgetId}`}>Název bloku:</label>
        <input
          id={`bn-t-${widgetId}`}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="input-stat"
          style={{ flex: 1 }}
        />
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
        <label className="label-stat">Velikost v gridu:</label>
        <select value={gridSize} onChange={(e) => onGridSizeChange(e.target.value)} className="select-grid-size" style={{ flex: 1 }}>
          <option value="1x1">📐 Malá kostka (1x1)</option>
          <option value="2x1">↔️ Široký banner (2x1)</option>
          <option value="1x2">↕️ Vysoký sloupec (1x2)</option>
          <option value="2x2">🔲 Obří blok (2x2)</option>
        </select>
      </div>

      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`bn-bg-${widgetId}`}>Pozadí:</label>
        <input id={`bn-bg-${widgetId}`} type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="input-color" />
        <label className="label-stat" htmlFor={`bn-txc-${widgetId}`} style={{ minWidth: 'auto', marginLeft: '1rem' }}>Text:</label>
        <input id={`bn-txc-${widgetId}`} type="color" value={textColor} onChange={(e) => onTextColorChange(e.target.value)} className="input-color" />
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
  const [gridSizeInput, setGridSizeInput] = useState(widget.data?.gridSize || '2x1');
  const [isPinned, setIsPinned] = useState(widget.data?.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setTextInput(widget.data?.text || 'Tvůj velký text...');
    setBgColorInput(widget.data?.bgColor || '#10b981');
    setTextColorInput(widget.data?.textColor || '#ffffff');
    setGridSizeInput(widget.data?.gridSize || '2x1');
    setIsPinned(widget.data?.isPinnedToSummary || false);
  }, [widget]);

  const currentMaxLength = getGridMaxLength(gridSizeInput);

  useEffect(() => {
    if (textInput.length > currentMaxLength) {
      setTextInput(textInput.substring(0, currentMaxLength));
    }
  }, [gridSizeInput, currentMaxLength, textInput]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(titleInput, {
        text: textInput,
        bgColor: bgColorInput,
        textColor: textColorInput,
        gridSize: gridSizeInput,
        isPinnedToSummary: isPinned,
      });
    }
    onCloseEdit();
  };

  return (
    <div className="banner-widget-container">
      {isEditing ? (
        <BannerEditForm
          widgetId={widget.id}
          title={titleInput}
          text={textInput}
          bgColor={bgColorInput}
          textColor={textColorInput}
          gridSize={gridSizeInput}
          isPinned={isPinned}
          maxLength={currentMaxLength}
          onTitleChange={setTitleInput}
          onTextChange={setTextInput}
          onGridSizeChange={setGridSizeInput}
          onBgColorChange={setBgColorInput}
          onTextColorChange={setTextColorInput}
          onPinnedChange={setIsPinned}
          onSave={handleSave}
        />
      ) : (
        <BannerDisplay text={textInput} bgColor={bgColorInput} textColor={textColorInput} />
      )}
    </div>
  );
}