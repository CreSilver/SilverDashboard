"use client";

import React, { useState, useEffect } from 'react';
import { TableWidget as TableWidgetType } from '../../types/dashboard';
import './tableWidget.css';

interface TableWidgetProps {
  widget: TableWidgetType;
  isEditing: boolean; // 🚀 Řízeno externě z karty
  onCloseEdit: () => void;
  onUpdate: (updatedTitle: string, updatedData: TableWidgetType['data']) => void;
}

interface EditFormProps {
  widgetId: string; title: string; headers: string[]; rows: string[][];
  onTitleChange: (val: string) => void; onHeaderChange: (index: number, val: string) => void; onCellChange: (rowIndex: number, colIndex: number, val: string) => void;
  onRemoveColumn: (colIndex: number) => void; onRemoveRow: (rowIndex: number) => void; onAddColumn: () => void; onAddRow: () => void; onSave: () => void;
}
function TableEditForm({
  widgetId, title, headers, rows,
  onTitleChange, onHeaderChange, onCellChange, onRemoveColumn, onRemoveRow, onAddColumn, onAddRow, onSave
}: EditFormProps) {
  return (
    <fieldset className="edit-form-section" style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <legend style={{ display: 'none' }}>Editace tabulky</legend>
      
      <div className="widget-title-row">
        <label className="label-stat" htmlFor={`table-title-${widgetId}`}>Název tabulky:</label>
        <input id={`table-title-${widgetId}`} type="text" value={title} onChange={(e) => onTitleChange(e.target.value)} className="input-stat" style={{ flex: 1 }} />
      </div>

      {/* 🚀 Ovládací prvky struktury se přesunuly přímo k tabulce */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' }}>
        <button type="button" onClick={onAddColumn} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>➕ Přidat sloupec</button>
        <button type="button" onClick={onAddRow} className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>➕ Přidat řádek</button>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="dashboard-table">
          <thead>
            <tr>
              {headers.map((header, colIndex) => (
                <th key={colIndex}>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <input type="text" value={header} onChange={(e) => onHeaderChange(colIndex, e.target.value)} className="table-input" />
                    {headers.length > 1 && <button type="button" onClick={() => onRemoveColumn(colIndex)} className="btn-cell-delete">🗑️</button>}
                  </div>
                </th>
              ))}
              <th style={{ width: '40px' }}>Akce</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <input type="text" value={cell} onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)} className="table-input" />
                  </td>
                ))}
                <td>{rows.length > 1 && <button type="button" onClick={() => onRemoveRow(rowIndex)} className="btn-cell-delete">❌</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default function TableWidget({ widget, isEditing, onCloseEdit, onUpdate }: TableWidgetProps) {
  const [titleInput, setTitleInput] = useState(widget.title);
  const [headers, setHeaders] = useState<string[]>(widget.data?.headers || ['Sloupec 1']);
  const [rows, setRows] = useState<string[][]>(widget.data?.rows || [['Data']]);

  useEffect(() => {
    setTitleInput(widget.title);
    setHeaders(widget.data?.headers || ['Sloupec 1']);
    setRows(widget.data?.rows || [['Data']]);
  }, [widget]);

  const handleSave = () => {
    onUpdate(titleInput, { headers, rows });
    onCloseEdit();
  };

  if (isEditing) {
    return (
      <TableEditForm
        widgetId={widget.id} title={titleInput} headers={headers} rows={rows} onTitleChange={setTitleInput}
        onHeaderChange={(i, v) => { const h = [...headers]; h[i] = v; setHeaders(h); }}
        onCellChange={(r, c, v) => setRows(rows.map((row, rIdx) => rIdx === r ? row.map((cell, cIdx) => cIdx === c ? v : cell) : row))}
        onRemoveColumn={(idx) => { setHeaders(headers.filter((_, i) => i !== idx)); setRows(rows.map(r => r.filter((_, i) => i !== idx))); }}
        onRemoveRow={(idx) => setRows(rows.filter((_, i) => i !== idx))}
        onAddColumn={() => { setHeaders([...headers, `Sloupec ${headers.length + 1}`]); setRows(rows.map(r => [...r, ''])); }}
        onAddRow={() => setRows([...rows, Array(headers.length).fill('')])} onSave={handleSave}
      />
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className="dashboard-table">
        <thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}