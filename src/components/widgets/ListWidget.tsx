"use client";

import React, { useState, useEffect } from 'react';
import { 
  ListWidget as ListWidgetType, 
  WidgetGridSize, 
  ListItem, 
  ListMode, 
  ListStyleType 
} from '../../types/dashboard';
import { WidgetSizeSelector } from '../widgetParts/size';
import { WidgetPinToggle } from '../widgetParts/pinned';
import './widgets.css';

interface ListWidgetProps {
  widget: ListWidgetType;
  isEditing: boolean;
  onCloseEdit: () => void;
  onUpdate?: (
    updatedTitle: string,
    updatedData: ListWidgetType['data'],
    gridSize?: WidgetGridSize,
    isPinned?: boolean
  ) => void;
}

export default function ListWidget({ widget, isEditing, onCloseEdit, onUpdate }: ListWidgetProps) {
  // Výchozí hodnoty z dat widgetu
  const mode = widget.data?.mode || 'standard';
  const listStyle = widget.data?.listStyle || 'bullet';
  const showPercentage = widget.data?.showPercentage ?? true;
  const items = widget.data?.items || [];

  // Stav formuláře
  const [titleInput, setTitleInput] = useState(widget.title);
  const [modeInput, setModeInput] = useState<ListMode>(mode);
  const [listStyleInput, setListStyleInput] = useState<ListStyleType>(listStyle);
  const [showPercentageInput, setShowPercentageInput] = useState<boolean>(showPercentage);
  const [itemsInput, setItemsInput] = useState<ListItem[]>(items);
  const [newItemText, setNewItemText] = useState('');

  // Klientský stav pro root parametry
  const [gridSizeInput, setGridSizeInput] = useState<WidgetGridSize>(widget.gridSize || '2x2');
  const [isPinnedInput, setIsPinnedInput] = useState(widget.isPinnedToSummary || false);

  useEffect(() => {
    setTitleInput(widget.title);
    setModeInput(widget.data?.mode || 'standard');
    setListStyleInput(widget.data?.listStyle || 'bullet');
    setShowPercentageInput(widget.data?.showPercentage ?? true);
    setItemsInput(widget.data?.items || []);
    setGridSizeInput(widget.gridSize || '2x2');
    setIsPinnedInput(widget.isPinnedToSummary || false);
  }, [widget]);

  // --- Handlery pro editační formulář ---
  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ListItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false
    };
    setItemsInput([...itemsInput, newItem]);
    setNewItemText('');
  };

  // 🚀 NOVINKA: Handler pro přidání mezery / volného místa
  const handleAddSpacer = () => {
    const newSpacer: ListItem = {
      id: crypto.randomUUID(),
      text: '',
      isSpacer: true
    };
    setItemsInput([...itemsInput, newSpacer]);
  };

  const handleRemoveItem = (id: string) => {
    setItemsInput(itemsInput.filter(item => item.id !== id));
  };

  const handleToggleItemCompletedInEdit = (id: string) => {
    setItemsInput(itemsInput.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleItemTextChange = (id: string, text: string) => {
    setItemsInput(itemsInput.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(
        titleInput,
        {
          mode: modeInput,
          listStyle: listStyleInput,
          showPercentage: showPercentageInput,
          items: itemsInput
        },
        gridSizeInput,
        isPinnedInput
      );
    }
    onCloseEdit();
  };

  // --- Quick-check handler v režimu prohlížení ---
  const handleToggleInPreview = (id: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    if (onUpdate) {
      onUpdate(widget.title, { ...widget.data, items: updatedItems }, widget.gridSize, widget.isPinnedToSummary);
    }
  };

  // =========================================================================
  // 1. EDITAČNÍ REŽIM
  // =========================================================================
  if (isEditing) {
    return (
      <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <legend style={{ display: 'none' }}>Nastavení seznamu</legend>

        <div className="widget-title-row">
          <label className="label-stat" htmlFor={`lst-t-${widget.id}`}>Název:</label>
          <input
            id={`lst-t-${widget.id}`}
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="input-stat"
            style={{ flex: 1 }}
          />
        </div>

        {/* Přepínač režimu: Seznam vs ToDo List */}
        <div className="widget-title-row">
          <label className="label-stat">Režim:</label>
          <div style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
            <button
              type="button"
              onClick={() => setModeInput('standard')}
              className="btn-secondary"
              style={{
                flex: 1,
                borderColor: modeInput === 'standard' ? '#34d399' : undefined,
                color: modeInput === 'standard' ? '#34d399' : undefined
              }}
            >
              📋 Seznam
            </button>
            <button
              type="button"
              onClick={() => setModeInput('todo')}
              className="btn-secondary"
              style={{
                flex: 1,
                borderColor: modeInput === 'todo' ? '#34d399' : undefined,
                color: modeInput === 'todo' ? '#34d399' : undefined
              }}
            >
              ☑️ ToDo List
            </button>
          </div>
        </div>

        {/* Nastavení odrážek pro Standardní Seznam */}
        {modeInput === 'standard' && (
          <div className="widget-title-row">
            <label className="label-stat" htmlFor={`lst-sty-${widget.id}`}>Styl odrážek:</label>
            <select
              id={`lst-sty-${widget.id}`}
              value={listStyleInput}
              onChange={(e) => setListStyleInput(e.target.value as ListStyleType)}
              className="input-stat"
              style={{ flex: 1 }}
            >
              <option value="bullet">• Tečkový (Odrážky)</option>
              <option value="numbered">1. Číselný (1, 2, 3)</option>
              <option value="alphabetical">a) Abecední (a, b, c)</option>
            </select>
          </div>
        )}

        {/* Nastavení procent pro ToDo List */}
        {modeInput === 'todo' && (
          <div className="widget-title-row">
            <label className="label-stat">Ukazatel %:</label>
            <label className="pinned-label" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={showPercentageInput}
                onChange={(e) => setShowPercentageInput(e.target.checked)}
              />
              <span>Zobrazit procento dokončení</span>
            </label>
          </div>
        )}

        {/* Správa položek seznamu */}
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label className="label-stat">Položky seznamu:</label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {itemsInput.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Žádné položky. Přidej první níže.</span>
            ) : (
              itemsInput.map((item) => (
                <div 
                  key={item.id} 
                  className="form-row" 
                  style={{ 
                    background: item.isSpacer ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.15)', 
                    padding: '0.25rem 0.4rem', 
                    borderRadius: '6px',
                    border: item.isSpacer ? '1px dashed rgba(255,255,255,0.1)' : 'none'
                  }}
                >
                  {/* 🚀 Vykreslení mezerového prvku v editoru */}
                  {item.isSpacer ? (
                    <span style={{ flex: 1, fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      ↕️ Volné místo (Mezera)
                    </span>
                  ) : (
                    <>
                      {modeInput === 'todo' && (
                        <input
                          type="checkbox"
                          checked={item.completed || false}
                          onChange={() => handleToggleItemCompletedInEdit(item.id)}
                          title={item.completed ? "Označit jako nedokončené" : "Označit jako hotové"}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                        className="input-stat"
                        style={{ 
                          flex: 1, 
                          textDecoration: (modeInput === 'todo' && item.completed) ? 'line-through' : 'none', 
                          opacity: (modeInput === 'todo' && item.completed) ? 0.6 : 1 
                        }}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn-secondary"
                    style={{ color: '#fca5a5', padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Vstupy pro přidání položky nebo mezery */}
          <div className="form-row" style={{ marginTop: '0.2rem', gap: '0.3rem' }}>
            <input
              type="text"
              placeholder="Nová položka..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
              className="input-stat"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={handleAddItem} className="btn-secondary" style={{ borderColor: '#34d399', color: '#34d399' }}>
              ➕ Přidat
            </button>
            {/* 🚀 NOVINKA: Tlačítko pro vložení mezery */}
            <button 
              type="button" 
              onClick={handleAddSpacer} 
              className="btn-secondary" 
              title="Vložit prázdné volné místo mezi položky"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94a3b8' }}
            >
              ↕️ Mezera
            </button>
          </div>
        </div>

        {/* Unifikovaná mřížka a připínání */}
        <WidgetSizeSelector value={gridSizeInput} onChange={setGridSizeInput} />
        <WidgetPinToggle isPinned={isPinnedInput} onChange={setIsPinnedInput} />

        <button
          type="button"
          onClick={handleSave}
          className="btn-secondary"
          style={{ backgroundColor: '#34d399', color: '#161a22', borderColor: '#34d399', fontWeight: 'bold', width: '100%', marginTop: '0.5rem', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          💾 Uložit pokrok
        </button>
      </fieldset>
    );
  }

  // =========================================================================
  // 2. REŽIM ZOBRAZENÍ (PREVIEW)
  // =========================================================================
  // Spočítáme pouze reálné úkoly (ignorujeme mezerové prvky při výpočtu procent)
  const realItems = items.filter(i => !i.isSpacer);
  const totalCount = realItems.length;
  const completedCount = realItems.filter(i => i.completed).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtr nedokončených úkolů (včetně mezer) pro ToDo náhled
  const incompleteOrSpacerItems = items.filter(i => i.isSpacer || !i.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem', width: '100%' }}>
      {/* Ukazatel procent v ToDo režimu */}
      {mode === 'todo' && showPercentage && totalCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
            <span>Plnění úkolů</span>
            <span style={{ color: '#34d399' }}>{percentage}% ({completedCount}/{totalCount})</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: '#34d399', transition: 'width 0.3s ease', borderRadius: '3px' }} />
          </div>
        </div>
      )}

      {/* Vykreslení položek podle režimu */}
      {mode === 'standard' ? (
        items.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '1rem' }}>
            Seznam je zatím prázdný.
          </p>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            {listStyle === 'bullet' && (
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.map(item => 
                  item.isSpacer ? (
                    <li key={item.id} style={{ listStyleType: 'none', height: '0.75rem' }} />
                  ) : (
                    <li key={item.id} style={{ fontSize: '0.9rem' }}>{item.text}</li>
                  )
                )}
              </ul>
            )}
            {listStyle === 'numbered' && (
              <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.map(item => 
                  item.isSpacer ? (
                    <li key={item.id} style={{ listStyleType: 'none', height: '0.75rem' }} />
                  ) : (
                    <li key={item.id} style={{ fontSize: '0.9rem' }}>{item.text}</li>
                  )
                )}
              </ol>
            )}
            {listStyle === 'alphabetical' && (
              <ol type="a" style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {items.map(item => 
                  item.isSpacer ? (
                    <li key={item.id} style={{ listStyleType: 'none', height: '0.75rem' }} />
                  ) : (
                    <li key={item.id} style={{ fontSize: '0.9rem' }}>{item.text}</li>
                  )
                )}
              </ol>
            )}
          </div>
        )
      ) : (
        /* ToDo Náhled (Zobrazuje pouze nedokončené úkoly a mezery) */
        incompleteOrSpacerItems.length === 0 ? (
          <p style={{ color: totalCount > 0 ? '#34d399' : '#64748b', fontSize: '0.85rem', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '1rem' }}>
            {totalCount > 0 ? '🎉 Všechny úkoly jsou splněny!' : 'Žádné úkoly k vyřízení.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            {incompleteOrSpacerItems.map(item => 
              item.isSpacer ? (
                <div key={item.id} style={{ height: '0.75rem' }} />
              ) : (
                <div
                  key={item.id}
                  onClick={() => handleToggleInPreview(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="todo-preview-item"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => {}}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#f1f5f9', flex: 1 }}>{item.text}</span>
                </div>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}