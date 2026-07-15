"use client";

import React, { useState, useEffect } from 'react';
import { updateFavicon } from './others/favicon';
import { Dashboard, DashboardWidget, WidgetType, WidgetGridSize } from '../types/dashboard';
import StatWidget from './widgets/StatWidget';
import TableWidget from './widgets/TableWidget';
import ImageWidget from './widgets/ImageWidget';
import TextWidget from './widgets/TextWidget';
import TimerWidget from './widgets/TimerWidget';
import ProgressWidget from './widgets/ProgressWidget';
import BannerWidget from './widgets/BannerWidget';
import LinksWidget from './widgets/LinkWidget';
import CounterWidget from './widgets/CounterWidget';
import CountUpWidget from './widgets/CountUpWidget';
import EmbedWidget from './widgets/EmbedWidget';
import './DashboardWorkspace.css';

interface WorkspaceProps {
  initialData: Dashboard;
}

async function apiUpdateDashboard(id: string, payload: any): Promise<Dashboard> {
  const response = await fetch(`/api/dashboards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Chyba při ukládání změn na disk.');
  return response.json();
}

function createWidgetDefaultData(type: WidgetType, title: string): DashboardWidget {
  const id = crypto.randomUUID();
  switch (type) {
    case 'embed':
      return { id, type: 'embed', title, gridSize: '2x2', isPinnedToSummary: false, data: { url: '' } };
    case 'table':
      return { id, type: 'table', title, gridSize: '2x2', isPinnedToSummary: false, data: { headers: ['Sloupec 1', 'Sloupec 2'], rows: [['Data 1', 'Data 2']] } };
    case 'image':
      return { id, type: 'image', title, gridSize: '2x2', isPinnedToSummary: false, data: { imageUrl: '' } };
    case 'text':
      return { id, type: 'text', title, gridSize: '2x1', isPinnedToSummary: false, data: { text: '' } };
    case 'timer':
      return { id, type: 'timer', title, gridSize: '2x2', isPinnedToSummary: false, data: { targetDate: '' } };
    case 'progress':
      return { id, type: 'progress', title, gridSize: '2x2', isPinnedToSummary: false, data: { currentValue: 0, targetValue: 100 } };
    case 'banner':
      return { id, type: 'banner', title, gridSize: '2x1', isPinnedToSummary: false, data: { text: 'Dnešní hlavní focus!', bgColor: '#10b981', textColor: '#ffffff' } };
    case 'links':
      return { id, type: 'links', title, gridSize: '2x2', isPinnedToSummary: false, data: { items: [] } };
    case 'counter': 
      return { id, type: 'counter', title, gridSize: '1x1', isPinnedToSummary: false, data: { currentValue: 0, step: 1, resetValue: 0 } };
    case 'countup':
      return { id, type: 'countup', title, gridSize: '2x1', isPinnedToSummary: false, data: { startDate: '' } };
    default:
      return { id, type: 'stat', title, gridSize: '2x2', isPinnedToSummary: false, data: { chartType: 'bar', items: [] } };
  }
}

function getWidgetGridClass(widget: DashboardWidget): string {
  // 🚀 OPRAVA ČTENÍ ROZMĚRU: Bereme velikost z rootu, ne z data!
  // Nastavíme bezpečné výchozí fallbacky podle typu, pokud starší JSON data rozměr nemají
  const defaultSize = widget.type === 'text' ? '2x1' : (widget.type === 'counter' ? '1x1' : '2x2');
  const size = widget.gridSize || defaultSize;
  
  // Rozložíme např. '3x4' na šířku 3 a výšku 4 a složíme unifikované třídy pro CSS grid
  const [w, h] = size.split('x');
  return `w-span-${w} h-span-${h}`;
}

const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  stat: StatWidget,
  progress: ProgressWidget,
  table: TableWidget,
  image: ImageWidget,
  text: TextWidget,
  timer: TimerWidget,
  banner: BannerWidget,
  links: LinksWidget,
  counter: CounterWidget,
  countup: CountUpWidget,
  embed: EmbedWidget,
};

function useDashboardState(initialData: Dashboard) {
  const [dashboard, setDashboard] = useState<Dashboard>(initialData);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(dashboard.title);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    setDashboard(initialData);
    setTitleInput(initialData.title);
  }, [initialData]);

  const handleSaveData = async (payload: { title?: string; widgets?: DashboardWidget[] }) => {
    setLoading(true);
    try {
      const data = await apiUpdateDashboard(dashboard.id, payload);
      setDashboard(data);
      setTitleInput(data.title);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ukládání selhalo');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveWidget = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= dashboard.widgets.length) return;
    const updatedWidgets = [...dashboard.widgets];
    const temp = updatedWidgets[index];
    updatedWidgets[index] = updatedWidgets[newIndex];
    updatedWidgets[newIndex] = temp;
    handleSaveData({ widgets: updatedWidgets });
  };

  const handleDeleteWidget = (widgetId: string, widgetTitle: string) => {
    if (!window.confirm(`Opravdu smazat prvek "${widgetTitle}"?`)) return;
    handleSaveData({ widgets: dashboard.widgets.filter((w) => w.id !== widgetId) });
    setActiveMenuId(null);
  };

  const handleCloneWidget = (widgetId: string) => {
    const widgetToClone = dashboard.widgets.find((w) => w.id === widgetId);
    if (!widgetToClone) return;
    const clonedWidget: DashboardWidget = {
      ...widgetToClone,
      id: crypto.randomUUID(),
      title: widgetToClone.title ? `${widgetToClone.title} (Kopie)` : "Kopie prvku",
      data: widgetToClone.data ? JSON.parse(JSON.stringify(widgetToClone.data)) : undefined,
      gridSize: widgetToClone.gridSize,
      isPinnedToSummary: widgetToClone.isPinnedToSummary
    };
    handleSaveData({ widgets: [...dashboard.widgets, clonedWidget] });
    setActiveMenuId(null);
  };

  // 🚀 OPRAVA UKLÁDÁNÍ: Přidány argumenty nextGridSize a nextIsPinned a zápis na root úroveň objektu!
  const handleWidgetUpdate = (
    widgetId: string, 
    nextTitle: string, 
    nextData: any, 
    nextGridSize?: WidgetGridSize, 
    nextIsPinned?: boolean
  ) => {
    handleSaveData({
      widgets: dashboard.widgets.map((w) =>
        w.id === widgetId 
          ? ({ 
              ...w, 
              title: nextTitle, 
              data: nextData,
              gridSize: nextGridSize,
              isPinnedToSummary: nextIsPinned
            } as DashboardWidget) 
          : w
      )
    });
  };

  const handleRenameSave = () => {
    setIsEditingTitle(false);
    if (!titleInput.trim() || titleInput === dashboard.title) {
      setTitleInput(dashboard.title);
      return;
    }
    handleSaveData({ title: titleInput });
  };

  const handleAddWidget = (type: WidgetType) => {
    const title = prompt(`Zadej název pro nový prvek (${type}):`);
    if (!title) return;
    setIsDropdownOpen(false);
    const newWidget = createWidgetDefaultData(type, title);
    handleSaveData({ widgets: [...dashboard.widgets, newWidget] });
  };

  return {
    dashboard, loading, isDropdownOpen, isEditingTitle, titleInput, activeMenuId,
    setTitleInput, setIsDropdownOpen, setIsEditingTitle, setActiveMenuId,
    handleMoveWidget, handleDeleteWidget, handleCloneWidget, handleWidgetUpdate, handleRenameSave, handleAddWidget
  };
}

interface HeaderProps {
  title: string; isEditingTitle: boolean; titleInput: string; loading: boolean; isDropdownOpen: boolean;
  onTitleClick: () => void; onTitleChange: (val: string) => void; onTitleBlur: () => void; onDropdownToggle: () => void; onAddWidget: (type: WidgetType) => void;
}
function WorkspaceHeader({ title, isEditingTitle, titleInput, loading, isDropdownOpen, onTitleClick, onTitleChange, onTitleBlur, onDropdownToggle, onAddWidget }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <section className="title-container">
        {isEditingTitle ? (
          <input type="text" value={titleInput} onChange={(e) => onTitleChange(e.target.value)} onBlur={onTitleBlur} onKeyDown={(e) => e.key === 'Enter' && onTitleBlur()} className="input-rename" autoFocus />
        ) : (
          <>
            <h1 className="dashboard-title">{title}</h1>
            <button onClick={onTitleClick} className="btn-icon">✏️</button>
          </>
        )}
      </section>
      <section className="controls-section">
        <div className="dropdown-wrapper">
          <button onClick={onDropdownToggle} className="btn-add" disabled={loading}>✨ + Přidat prvek</button>
          {isDropdownOpen && (
            <menu className="dropdown-menu">
              {(Object.keys(WIDGET_COMPONENTS) as WidgetType[]).map((type) => (
                <li key={type}>
                  <button onClick={() => onAddWidget(type)} className="dropdown-item-btn">
                    {type === 'stat' ? '📊 Graf' : type === 'progress' ? '🎯 Progress bar' : type === 'table' ? '📅 Tabulka' : type === 'image' ? '🖼️ Obrázek' : type === 'text' ? '📝 Textový box' : type === 'timer' ? '⏳ Odpočet času' : type === 'links' ? '🔗 Odkazy' : type === 'counter' ? '🔢 Počítadlo' : type === 'countup' ? '⏱️ Čas od milníku' : type === 'embed' ? '🌐 Webový Embed' : '📣 Banner'}
                  </button>
                </li>
              ))}
            </menu>
          )}
        </div>
      </section>
    </header>
  );
}

interface CardProps {
  widget: DashboardWidget; index: number; totalWidgets: number; loading: boolean; activeMenuId: string | null;
  onMove: (index: number, direction: 'left' | 'right') => void; onDelete: (id: string, title: string) => void; onClone: (id: string) => void; onToggleMenu: (id: string | null) => void; onUpdate: (id: string, nextTitle: string, nextData: any, gridSize?: WidgetGridSize, isPinned?: boolean) => void;
}
function WidgetCard({ widget, index, totalWidgets, loading, activeMenuId, onMove, onDelete, onClone, onToggleMenu, onUpdate }: CardProps) {
  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const gridClass = getWidgetGridClass(widget);
  const [isEditing, setIsEditing] = useState(!widget.data || Object.keys(widget.data).length === 0 || (widget.type === 'counter' && widget.data?.currentValue === undefined));

  return (
    <article className={`widget-card ${gridClass}`}>
      <header className="widget-card-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <nav className="widget-order-controls" style={{ position: 'relative' }}>
            <button onClick={() => onMove(index, 'left')} disabled={index === 0 || loading} className="btn-order">⬅️</button>
            <button onClick={() => onMove(index, 'right')} disabled={index === totalWidgets - 1 || loading} className="btn-order">➡️</button>
            <button onClick={(e) => { e.stopPropagation(); onToggleMenu(activeMenuId === widget.id ? null : widget.id); }} disabled={loading} className="btn-order" style={{ marginLeft: '4px' }}>⚙️</button>
            {activeMenuId === widget.id && (
              <menu className="widget-context-menu">
                <li><button onClick={() => { setIsEditing(true); onToggleMenu(null); }} className="context-menu-item">✏️ Nastavení</button></li>
                <li><button onClick={() => onClone(widget.id)} className="context-menu-item">📋 Klonovat prvek</button></li>
                <li><button onClick={() => onDelete(widget.id, widget.title)} className="context-menu-item item-danger">🗑️ Odstranit prvek</button></li>
              </menu>
            )}
          </nav>
          <h3 className="widget-card-title">{widget.title}</h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#666' }}>{widget.type}</span>
      </header>
      {/* 🚀 PROPOJENÍ UPDATE METODY: WidgetComponent předává 4 argumenty, které posíláme dál do useDashboardState */}
      {WidgetComponent && (
        <WidgetComponent 
          widget={widget} 
          isEditing={isEditing} 
          onCloseEdit={() => setIsEditing(false)} 
          onUpdate={(nextTitle: string, nextData: any, nextGridSize?: WidgetGridSize, nextIsPinned?: boolean) => 
            onUpdate(widget.id, nextTitle, nextData, nextGridSize, nextIsPinned)
          } 
        />
      )}
    </article>
  );
}

export default function DashboardWorkspace({ initialData }: WorkspaceProps) {
  const state = useDashboardState(initialData);
  const [themeColor, setThemeColor] = useState('#34d399');

  useEffect(() => {
    const savedColor = localStorage.getItem(`theme-color-${initialData.id}`) || '#34d399';
    setThemeColor(savedColor);

    const defaultIcon = (initialData.title === 'Hlavní přehled' || initialData.title === 'Dashboard') ? '🏠' : '📊';
    const savedIcon = localStorage.getItem(`theme-icon-${initialData.id}`) || defaultIcon;
    updateFavicon(savedIcon);

    const handleColorEvent = (e: Event) => setThemeColor((e as CustomEvent).detail);
    const handleIconEvent = (e: Event) => updateFavicon((e as CustomEvent).detail);

    window.addEventListener('theme-color-changed', handleColorEvent);
    window.addEventListener('theme-icon-changed', handleIconEvent);
    
    return () => {
      window.removeEventListener('theme-color-changed', handleColorEvent);
      window.removeEventListener('theme-icon-changed', handleIconEvent);
    };
  }, [initialData.id]);

  useEffect(() => {
    const currentTitle = state.dashboard.title;
    if (!currentTitle || currentTitle === 'Hlavní přehled' || currentTitle === 'Dashboard') {
      document.title = 'Dashboard';
    } else {
      document.title = `${currentTitle} | Dashboard`;
    }
  }, [state.dashboard.title]);

  return (
    <div 
      className="workspace-page-container" 
      style={{
        background: `linear-gradient(135deg, ${themeColor}12 0%, #161a22 50%, #11141a 100%)`,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <WorkspaceHeader
        title={state.dashboard.title} isEditingTitle={state.isEditingTitle} titleInput={state.titleInput} loading={state.loading} isDropdownOpen={state.isDropdownOpen}
        onTitleClick={() => state.setIsEditingTitle(true)} onTitleChange={state.setTitleInput} onTitleBlur={state.handleRenameSave} onDropdownToggle={() => state.setIsDropdownOpen(!state.isDropdownOpen)} onAddWidget={state.handleAddWidget}
      />

      <section className="widgets-grid" onClick={() => state.setActiveMenuId(null)}>
        {state.dashboard.widgets.length === 0 ? (
          <article className="empty-state">
            <p>Tento dashboard je zatím prázdný. Přidej svůj první prvek pomocí tlačítek nahoře.</p>
          </article>
        ) : (
          state.dashboard.widgets.map((widget, index) => (
            <WidgetCard
              key={widget.id} widget={widget} index={index} totalWidgets={state.dashboard.widgets.length} loading={state.loading} activeMenuId={state.activeMenuId}
              onMove={state.handleMoveWidget} onDelete={state.handleDeleteWidget} onClone={state.handleCloneWidget} onToggleMenu={state.setActiveMenuId} onUpdate={state.handleWidgetUpdate}
            />
          ))
        )}
      </section>
    </div>
  );
}