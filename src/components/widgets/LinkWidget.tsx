"use client";

import React, { useState, useEffect } from 'react';
import { LinksWidget as LinksWidgetType, LinkItem, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css';

interface LinksWidgetProps {
  widget: LinksWidgetType;
  isEditing: boolean; 
  onCloseEdit: () => void;
  onUpdate?: (
    updatedTitle: string, 
    updatedData: LinksWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

function formatUrl(url: string): string {
  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) return `https://${formattedUrl}`;
  return formattedUrl;
}

interface EditFormProps {
  widgetId: string; title: string; items: LinkItem[]; newIcon: string; newLabel: string; newUrl: string;
  gridSize: WidgetGridSize; isPinned: boolean;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onIconChange: (val: string) => void;
  onLabelChange: (val: string) => void; onUrlChange: (val: string) => void;
  onAddLink: () => void; onRemoveLink: (id: string) => void; onMoveLink: (index: number, direction: 'up' | 'down') => void;
  onGridSizeChange: (val: WidgetGridSize) => void; onIsPinnedChange: (val: boolean) => void; onSave: () => void;
}

function LinksEditForm({
  widgetId, title, items, newIcon, newLabel, newUrl, gridSize, isPinned,
  onTitleChange, onIconChange, onLabelChange, onUrlChange, onAddLink, onRemoveLink, onMoveLink, onGridSizeChange, onIsPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', boxSizing: 'border-box' }}>
      <legend style={{ display: 'none' }}>Nastavení odkazů</legend>
      
      {/* Název bloku */}
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`lnk-t-${widgetId}`}>Název bloku:</label>
        <input id={`lnk-t-${widgetId}`} type="text" value={title} onChange={onTitleChange} className="input-stat" style={{ flex: 1, minWidth: 0 }} />
      </div>

      {/* Seznam existujících odkazů s ošetřeným přetékáním */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
        <label className="label-stat">Existující odkazy:</label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          {items.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Žádné odkazy. Přidej první níže.</span>
          ) : (
            items.map((item, idx) => (
              <div 
                key={item.id} 
                className="form-row" 
                style={{ 
                  background: 'rgba(0,0,0,0.15)', 
                  padding: '0.35rem 0.5rem', 
                  borderRadius: '6px', 
                  gap: '0.4rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Tlačítka pro posun pořadí */}
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => onMoveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="btn-secondary"
                    style={{ padding: '0.1rem 0.25rem', fontSize: '0.65rem' }}
                    title="Posunout nahoru"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveLink(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="btn-secondary"
                    style={{ padding: '0.1rem 0.25rem', fontSize: '0.65rem' }}
                    title="Posunout dolů"
                  >
                    ⬇️
                  </button>
                </div>

                {/* Ikona a Název odkazu s flexibilitou */}
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                <span 
                  style={{ 
                    fontSize: '0.85rem', 
                    color: '#f1f5f9', 
                    fontWeight: 600, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    flex: 1,
                    minWidth: 0 
                  }}
                >
                  {item.label}
                </span>

                {/* Tlačítko smazat */}
                <button 
                  type="button"
                  onClick={() => onRemoveLink(item.id)} 
                  className="btn-secondary" 
                  style={{ color: '#fca5a5', padding: '0.15rem 0.4rem', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', flexShrink: 0 }}
                >
                  ❌ Smazat
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Formulář pro přidání nového odkazu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
        <div className="form-row">
          <input type="text" placeholder="Emoji" value={newIcon} onChange={(e) => onIconChange(e.target.value)} className="input-stat" style={{ width: '55px', textAlign: 'center', flexShrink: 0 }} />
          <input type="text" placeholder="Název" value={newLabel} onChange={(e) => onLabelChange(e.target.value)} className="input-stat" style={{ flex: 1, minWidth: 0 }} />
        </div>
        <div className="form-row">
          <input type="text" placeholder="URL adresa" value={newUrl} onChange={(e) => onUrlChange(e.target.value)} className="input-stat" style={{ flex: 1, minWidth: 0 }} />
          <button type="button" onClick={onAddLink} className="btn-secondary" style={{ borderColor: '#34d399', color: '#34d399', flexShrink: 0 }}>➕ Přidat</button>
        </div>
      </div>

      {/* Sdílené prvky pro mřížku a připínání */}
      <WidgetSizeSelector value={gridSize} onChange={onGridSizeChange} />
      <WidgetPinToggle isPinned={isPinned} onChange={onIsPinnedChange} />

      <button 
        type="button"
        onClick={onSave} 
        className="btn-secondary"
        style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
      >
        💾 Uložit pokrok
      </button>
    </fieldset>
  );
}

export default function LinksWidget({ widget, isEditing, onCloseEdit, onUpdate }: LinksWidgetProps) {
  const items = widget.data?.items || [];
  const [titleInput, setTitleInput] = useState(widget.title);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('🔗');
  
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x2');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setGridSizeInput(widget.gridSize || '2x2');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updatedItems = [...items];
    const temp = updatedItems[index];
    updatedItems[index] = updatedItems[targetIndex];
    updatedItems[targetIndex] = temp;

    if (onUpdate) {
      onUpdate(titleInput, { items: updatedItems }, gridSizeInput, isPinnedInput);
    }
  };

  const handleAddLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const newItem = { id: crypto.randomUUID(), label: newLabel.trim(), url: formatUrl(newUrl), icon: newIcon.trim() || '🔗' };
    if (onUpdate) onUpdate(titleInput, { items: [...items, newItem] }, gridSizeInput, isPinnedInput);
    setNewLabel(''); setNewUrl(''); setNewIcon('🔗');
  };

  const handleRemoveLink = (id: string) => {
    if (onUpdate) onUpdate(titleInput, { items: items.filter(item => item.id !== id) }, gridSizeInput, isPinnedInput);
  };

  const handleSaveMeta = () => {
    if (onUpdate) onUpdate(titleInput, { items }, gridSizeInput, isPinnedInput);
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <LinksEditForm
        widgetId={widget.id} title={titleInput} items={items} gridSize={gridSizeInput} isPinned={isPinnedInput}
        newIcon={newIcon} newLabel={newLabel} newUrl={newUrl}
        onTitleChange={(e) => setTitleInput(e.target.value)} onIconChange={setNewIcon} onLabelChange={setNewLabel} onUrlChange={setNewUrl}
        onAddLink={handleAddLink} onRemoveLink={handleRemoveLink} onMoveLink={handleMoveLink} onGridSizeChange={setGridSizeInput} onIsPinnedChange={setIsPinnedInput} onSave={handleSaveMeta}
      />
    );
  }

  return (
    <article className="links-grid-display">
      {items.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>Žádné odkazy.</p> : 
        items.map(item => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="link-tile"><span className="link-tile-icon">{item.icon}</span><span className="link-tile-label">{item.label}</span></a>)}
    </article>
  );
}