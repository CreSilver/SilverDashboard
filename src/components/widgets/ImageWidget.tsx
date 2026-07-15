"use client";

import React, { useState, useEffect } from 'react';
import { ImageWidget as ImageWidgetType, WidgetGridSize } from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css'; // 🚀 Přesměrováno na jednotný styl

interface ImageWidgetProps {
  widget: ImageWidgetType;
  isEditing: boolean; 
  onCloseEdit: () => void;
  onUpdate: (
    updatedTitle: string, 
    updatedData: ImageWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

async function apiUploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Nahrávání souboru selhalo.');
  const data = await response.json();
  return data.imageUrl;
}

function measureImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
  });
}

interface EditFormProps {
  widgetId: string; title: string; caption: string; hasUrl: boolean; loading: boolean;
  gridSize: WidgetGridSize; isPinned: boolean;
  onTitleChange: (val: string) => void; onCaptionChange: (val: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGridSizeChange: (val: WidgetGridSize) => void; onIsPinnedChange: (val: boolean) => void; onSave: () => void;
}
function ImageEditForm({
  widgetId, title, caption, hasUrl, loading, gridSize, isPinned,
  onTitleChange, onCaptionChange, onFileChange, onGridSizeChange, onIsPinnedChange, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Nastavení nahrávání</legend>
      
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`img-t-${widgetId}`}>Název bloku:</label>
        <input id={`img-t-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>

      <label className="image-upload-zone">
        {loading ? '⏳ Ukládám soubor na disk...' : '📁 Klikni pro výběr vlastní fotky z PC'}
        <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} disabled={loading} />
      </label>

      {/* 📐 Sdílené prvky pro mřížku a připínání jsou k dispozici ihned */}
      <WidgetSizeSelector value={gridSize} onChange={onGridSizeChange} />
      <WidgetPinToggle isPinned={isPinned} onChange={onIsPinnedChange} />

      {hasUrl && (
        <>
          <div className="widget-title-row">
            <label className="label-stat" htmlFor={`img-c-${widgetId}`}>Popisek:</label>
            <input id={`img-c-${widgetId}`} type="text" value={caption} onChange={(e) => onCaptionChange(e.target.value)} className="input-stat" style={{ flex: 1 }} placeholder="Přidej popisek..." />
          </div>
          <button 
            onClick={onSave} 
            className="btn-secondary" 
            style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            💾 Uložit pokrok
          </button>
        </>
      )}
    </fieldset>
  );
}

export default function ImageWidget({ widget, isEditing, onCloseEdit, onUpdate }: ImageWidgetProps) {
  const propUrl = widget.data?.imageUrl || '';
  const propCaption = widget.data?.caption || '';
  const propWidth = widget.data?.width || 0;
  const propHeight = widget.data?.height || 0;

  const [titleInput, setTitleInput] = useState(widget.title);
  const [captionInput, setCaptionInput] = useState(propCaption);
  const [loading, setLoading] = useState(false);
  
  // 🚀 Sjednocený klientský stav pro parametry z rootu (výchozí 2x2)
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x2');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setCaptionInput(widget.data?.caption || '');
    setGridSizeInput(widget.gridSize || '2x2');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const serverUrl = await apiUploadFile(file);
      const dimensions = await measureImageDimensions(serverUrl);
      onUpdate(
        titleInput, 
        { imageUrl: serverUrl, caption: captionInput, width: dimensions.width, height: dimensions.height },
        gridSizeInput,
        isPinnedInput
      );
      onCloseEdit();
    } catch (error) {
      alert('Chyba při zpracování obrázku.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeta = () => {
    onUpdate(
      titleInput, 
      { imageUrl: propUrl, caption: captionInput, width: propWidth, height: propHeight },
      gridSizeInput,
      isPinnedInput
    );
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <ImageEditForm
        widgetId={widget.id} title={titleInput} caption={captionInput} hasUrl={!!propUrl} loading={loading}
        gridSize={gridSizeInput} isPinned={isPinnedInput}
        onTitleChange={setTitleInput} onCaptionChange={setCaptionInput} onFileChange={handleFileChange}
        onGridSizeChange={setGridSizeInput} onIsPinnedChange={setIsPinnedInput} onSave={handleSaveMeta}
      />
    );
  }

  return (
    <article className="image-preview-box">
      {propUrl ? <img src={propUrl} alt={widget.title} className="display-image" /> : <p style={{ color: '#949ba4', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Žádný obrázek.</p>}
      {propCaption && <p className="image-caption">{propCaption}</p>}
      {propWidth > 0 && <div className="image-meta-badge">📐 {propWidth}×{propHeight} px</div>}
    </article>
  );
}