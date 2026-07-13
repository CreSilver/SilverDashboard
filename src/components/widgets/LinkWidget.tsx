"use client";

import React, { useState, useEffect } from 'react';
import { LinksWidget as LinksWidgetType, LinkItem } from '../../types/dashboard';
import './linkWidget.css';

interface LinksWidgetProps {
  widget: LinksWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate?: (updatedTitle: string, updatedData: LinksWidgetType['data']) => void;
}

function formatUrl(url: string): string {
  let formattedUrl = url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) return `https://${formattedUrl}`;
  return formattedUrl;
}

interface EditFormProps {
  widgetId: string;
  title: string;
  items: LinkItem[];
  isPinned: boolean;
  newIcon: string;
  newLabel: string;
  newUrl: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIconChange: (val: string) => void;
  onLabelChange: (val: string) => void;
  onUrlChange: (val: string) => void;
  onAddLink: () => void;
  onRemoveLink: (id: string) => void;
  onPinnedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}
function LinksEditForm({
  widgetId, title, items, isPinned, newIcon, newLabel, newUrl,
  onTitleChange, onIconChange, onLabelChange, onUrlChange, onAddLink, onRemoveLink, onPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Nastavení odkazů</legend>
      
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`lnk-t-${widgetId}`}>Název bloku:</label>
        <input id={`lnk-t-${widgetId}`} type="text" value={title} onChange={onTitleChange} className="input-stat" style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '110px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {items.map((item) => (
          <div key={item.id} className="form-row" style={{ background: 'rgba(0,0,0,0.15)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: '0.85rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            <button onClick={() => onRemoveLink(item.id)} className="btn-secondary" style={{ color: '#fca5a5', padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}>❌ Smazat</button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="form-row">
          <input type="text" placeholder="Emoji" value={newIcon} onChange={(e) => onIconChange(e.target.value)} className="input-stat" style={{ width: '55px', textAlign: 'center' }} />
          <input type="text" placeholder="Název" value={newLabel} onChange={(e) => onLabelChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
        </div>
        <div className="form-row">
          <input type="text" placeholder="URL adresa" value={newUrl} onChange={(e) => onUrlChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
          <button onClick={onAddLink} className="btn-secondary" style={{ borderColor: '#34d399', color: '#34d399' }}>➕ Přidat</button>
        </div>
      </div>

      <label className="pinned-label">
        <input type="checkbox" checked={isPinned} onChange={onPinnedChange} />
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

export default function LinksWidget({ widget, isEditing, onCloseEdit, onUpdate }: LinksWidgetProps) {
  const items = widget.data?.items || [];
  const [titleInput, setTitleInput] = useState(widget.title);
  const [isPinned, setIsPinned] = useState(widget.data?.isPinnedToSummary || false);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('🔗');

  useEffect(() => {
    setTitleInput(widget.title);
    setIsPinned(widget.data?.isPinnedToSummary || false);
  }, [widget]);

  const handleAddLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const newItem = { id: crypto.randomUUID(), label: newLabel.trim(), url: formatUrl(newUrl), icon: newIcon.trim() || '🔗' };
    if (onUpdate) onUpdate(titleInput, { items: [...items, newItem], isPinnedToSummary: isPinned });
    setNewLabel(''); setNewUrl(''); setNewIcon('🔗');
  };

  const handleRemoveLink = (id: string) => {
    if (onUpdate) onUpdate(titleInput, { items: items.filter(item => item.id !== id), isPinnedToSummary: isPinned });
  };

  const handleSaveMeta = () => {
    if (onUpdate) onUpdate(titleInput, { items, isPinnedToSummary: isPinned });
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <LinksEditForm
        widgetId={widget.id} title={titleInput} items={items} isPinned={isPinned} newIcon={newIcon} newLabel={newLabel} newUrl={newUrl}
        onTitleChange={(e) => setTitleInput(e.target.value)} onIconChange={setNewIcon} onLabelChange={setNewLabel} onUrlChange={setNewUrl}
        onAddLink={handleAddLink} onRemoveLink={handleRemoveLink} onPinnedChange={(e) => setIsPinned(e.target.checked)} onSave={handleSaveMeta}
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