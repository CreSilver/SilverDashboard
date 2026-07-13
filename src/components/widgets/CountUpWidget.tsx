"use client";

import React, { useState, useEffect } from 'react';
import { EmbedWidget as EmbedWidgetType } from '../../types/dashboard';

interface EmbedWidgetProps {
  widget: EmbedWidgetType;
  isEditing: boolean;
  onCloseEdit: () => void;
  onUpdate?: (updatedTitle: string, updatedData: EmbedWidgetType['data']) => void;
}

export default function EmbedWidget({ widget, isEditing, onCloseEdit, onUpdate }: EmbedWidgetProps) {
  const propUrl = widget.data?.url || '';
  const propGridSize = widget.data?.gridSize || '2x2';

  const [titleInput, setTitleInput] = useState(widget.title);
  const [urlInput, setUrlInput] = useState(propUrl);
  const [gridSizeInput, setGridSizeInput] = useState(propGridSize);

  useEffect(() => {
    setTitleInput(widget.title);
    setUrlInput(widget.data?.url || '');
    setGridSizeInput(widget.data?.gridSize || '2x2');
  }, [widget]);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(titleInput, { url: urlInput, gridSize: gridSizeInput });
    }
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <legend style={{ display: 'none' }}>Nastavení Vloženého webu</legend>
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`embed-t-${widget.id}`}>Název prvku:</label>
          <input id={`embed-t-${widget.id}`} type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="input-stat" style={{ flex: 1 }} />
        </div>
        
        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`embed-u-${widget.id}`}>Adresa webu (URL):</label>
          <input 
            id={`embed-u-${widget.id}`} 
            type="text" 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)} 
            className="input-stat" 
            style={{ flex: 1 }} 
            placeholder="https://docs.google.com/spreadsheets/.../preview" 
          />
        </div>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`embed-g-${widget.id}`}>Rozměry na ploše:</label>
          <select 
            id={`embed-g-${widget.id}`} 
            value={gridSizeInput} 
            onChange={(e) => setGridSizeInput(e.target.value as any)} 
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

        <button onClick={handleSave} className="btn-secondary" style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}>
          💾 Uložit a změnit velikost
        </button>
      </fieldset>
    );
  }

  if (!propUrl) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '2rem', margin: 0 }}>
        <p style={{ fontWeight: 'bold' }}>Není nastavena URL adresa webu.</p>
        <span style={{ fontSize: '0.75rem', color: '#475569' }}>Klikni nahoře na ozubené kolečko a vlož odkaz.</span>
      </div>
    );
  }

  return (
    <div className="embed-widget-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 🚀 NOVINKA: Elegantní skleněná lišta s rychlým odkazem ven */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '0.5rem',
        flexShrink: 0 
      }}>
        <a 
          href={propUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            fontSize: '0.72rem', 
            color: '#34d399', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.3rem',
            background: 'rgba(52, 211, 153, 0.08)',
            padding: '0.25rem 0.6rem',
            borderRadius: '5px',
            border: '1px solid rgba(52, 211, 153, 0.15)',
            transition: 'all 0.2s',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(52, 211, 153, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.15)';
          }}
        >
          🌐 Otevřít na plné obrazovce ↗
        </a>
      </div>

      <div className="embed-iframe-container" style={{ flex: 1, height: '100%' }}>
        <iframe 
          src={propUrl} 
          title={widget.title}
          className="embed-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}