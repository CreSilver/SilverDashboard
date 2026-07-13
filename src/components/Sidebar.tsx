"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Dashboard } from '../types/dashboard';
import './Sidebar.css';

// =========================================================================
// 🎯 1. VRSTVA SÍŤOVÝCH OPERACÍ (API)
// =========================================================================
async function apiFetchDashboards(): Promise<Dashboard[]> {
  const response = await fetch('/api/dashboards');
  if (!response.ok) throw new Error('Nepodařilo se načíst místa');
  return response.json();
}

async function apiCreateDashboard(title: string): Promise<Dashboard> {
  const response = await fetch('/api/dashboards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Nepodařilo se vytvořit místo');
  return response.json();
}

async function apiUpdateDashboard(id: string, payload: { title?: string; widgets?: any[] }): Promise<Dashboard> {
  const response = await fetch(`/api/dashboards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Nepodařilo se aktualizovat místo na disku serveru.');
  return response.json();
}

async function apiDeleteDashboard(id: string): Promise<void> {
  const response = await fetch(`/api/dashboards/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Nepodařilo se smazat místo z disku');
}

async function apiFetchFullDashboard(id: string): Promise<Dashboard> {
  const response = await fetch(`/api/dashboards/${id}`);
  if (!response.ok) throw new Error('Nepodařilo se stáhnout kompletní data místa');
  return response.json();
}

async function apiUploadRestoredFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Zápis importované fotky na disk serveru selhal.');
  const data = await response.json();
  return data.imageUrl;
}

// =========================================================================
// 🎯 2. POMOCNÁ PURE JS LOGIKA (File Converters)
// =========================================================================
async function fetchUrlToBase64(url: string): Promise<string> {
  const absoluteUrl = url.startsWith('/') ? window.location.origin + url : url;
  const res = await fetch(absoluteUrl);
  if (!res.ok) throw new Error(`Chyba stahování souboru pro zálohu: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToFile(base64DataUrl: string, filename: string): File {
  const arr = base64DataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1].replace(/\s/g, ''));
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) { u8arr[n] = bstr.charCodeAt(n); }
  return new File([u8arr], filename, { type: mime });
}

function triggerFileDownload(data: any, fileName: string) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

const PRESET_COLORS = [
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Ruby', hex: '#ef4444' },
  { name: 'Sapphire', hex: '#3b82f6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Amethyst', hex: '#a855f7' }
];

// 🚀 PRESETY IKON PRO TVŮJ TECHNICKÝ VELÍN
const PRESET_ICONS = ['📊', '🏠', '🚀', '💻', '🔒', '⚙️', '📈', '🎯', '🛠️'];

// =========================================================================
// 🎯 3. SUB-KOMPONENTA: NAVIGACE PANELU (Stateless)
// =========================================================================
interface NavProps {
  dashboards: Dashboard[]; pathname: string; activeMenuId: string | null; colorPickerOpenId: string | null; iconPickerOpenId: string | null; isCollapsed: boolean;
  onToggleMenu: (id: string | null) => void; onToggleColorPicker: (id: string | null) => void; onToggleIconPicker: (id: string | null) => void;
  onSelectColor: (id: string, hex: string) => void; onSelectIcon: (id: string, icon: string) => void;
  onAddClick: () => void; onRenameClick: (id: string, title: string) => void; onDuplicateClick: (id: string, title: string) => void;
  onExportClick: (id: string, title: string) => void; onDeleteClick: (id: string, title: string) => void; onCloseMobile: () => void;
}
function SidebarNav({
  dashboards, pathname, activeMenuId, colorPickerOpenId, iconPickerOpenId, isCollapsed,
  onToggleMenu, onToggleColorPicker, onToggleIconPicker, onSelectColor, onSelectIcon,
  onAddClick, onRenameClick, onDuplicateClick, onExportClick, onDeleteClick, onCloseMobile
}: NavProps) {
  return (
    <nav className="nav-container">
      <Link href="/" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`} onClick={() => { onToggleMenu(null); onToggleColorPicker(null); onToggleIconPicker(null); onCloseMobile(); }}>
        <span>🏠</span>
        {!isCollapsed && <span className="link-text">Hlavní přehled</span>}
      </Link>

      {/* 🚀 ODDĚLENÍ: Dělící skleněná čára oddělující hlavní panel od projektových míst */}
      <div className="sidebar-divider" />

      {!isCollapsed && <div className="section-header">Moje Místa</div>}
      
      <div className="scroll-list">
        {dashboards.map((dash) => {
          const isActive = pathname === `/dashboard/${dash.id}`;
          return (
            <div key={dash.id} className="sidebar-item-wrapper" style={{ position: 'relative' }}>
              <Link href={`/dashboard/${dash.id}`} className={`sidebar-link ${isActive ? 'active' : ''}`} onClick={() => { onToggleMenu(null); onToggleColorPicker(null); onToggleIconPicker(null); onCloseMobile(); }}>
                {/* 🚀 DYNAMICKÁ IKONA: Renderuje konkrétní emoji přiřazené tomuto ID */}
                <span>{dash.themeIcon || '📊'}</span>
                {!isCollapsed && <span className="link-text">{dash.title}</span>}
              </Link>
              
              {!isCollapsed && (
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleMenu(activeMenuId === dash.id ? null : dash.id); onToggleColorPicker(null); onToggleIconPicker(null); }}
                  className="btn-sidebar-options"
                  title="Možnosti místa"
                >
                  ⋮
                </button>
              )}

              {!isCollapsed && activeMenuId === dash.id && (
                <menu className="sidebar-context-menu">
                  <li><button onClick={() => onRenameClick(dash.id, dash.title)} className="sidebar-context-btn">✏️ Přejmenovat</button></li>
                  <li><button onClick={() => onDuplicateClick(dash.id, dash.title)} className="sidebar-context-btn">📋 Duplikovat</button></li>
                  
                  {/* Barevný strip */}
                  <li>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleColorPicker(colorPickerOpenId === dash.id ? null : dash.id); onToggleIconPicker(null); }} className="sidebar-context-btn">
                      🎨 Změnit barvu
                    </button>
                    {colorPickerOpenId === dash.id && (
                      <div className="sidebar-color-picker-row" onClick={(e) => e.stopPropagation()}>
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c.hex}
                            onClick={() => onSelectColor(dash.id, c.hex)}
                            className={`color-picker-dot ${dash.themeColor === c.hex ? 'active' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    )}
                  </li>

                  {/* 🚀 NOVINKA: Ikonový strip schovaný pod možnostmi */}
                  <li>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleIconPicker(iconPickerOpenId === dash.id ? null : dash.id); onToggleColorPicker(null); }} className="sidebar-context-btn">
                      🎭 Změnit ikonu...
                    </button>
                    {iconPickerOpenId === dash.id && (
                      <div className="sidebar-icon-picker-row" onClick={(e) => e.stopPropagation()}>
                        {PRESET_ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => onSelectIcon(dash.id, icon)}
                            className={`icon-picker-btn ${dash.themeIcon === icon ? 'active' : ''}`}
                            title="Zvolit ikonu"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>

                  <li style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0.2rem 0' }} />
                  <li><button onClick={() => onExportClick(dash.id, dash.title)} className="sidebar-context-btn">📥 Exportovat</button></li>
                  <li><button onClick={() => onDeleteClick(dash.id, dash.title)} className="sidebar-context-btn danger">🗑️ Smazat</button></li>
                </menu>
              )}
            </div>
          );
        })}

        <button onClick={onAddClick} className="btn-sidebar-add-inline" title="Přidat nové místo">
          {isCollapsed ? "➕" : "➕ Přidat nové místo..."}
        </button>
      </div>
    </nav>
  );
}

// =========================================================================
// =========================================================================
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [colorPickerOpenId, setColorPickerOpenId] = useState<string | null>(null);
  const [iconPickerOpenId, setIconPickerOpenId] = useState<string | null>(null); // 🚀 Řízení viditelnosti ikon
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const loadDashboards = async () => {
    try {
      const data = await apiFetchDashboards();
      // Párujeme data z RAM paměti jak s lokální barvou, tak s lokální ikonou
      const localizedData = data.map(d => ({
        ...d,
        themeColor: localStorage.getItem(`theme-color-${d.id}`) || '#34d399',
        themeIcon: localStorage.getItem(`theme-icon-${d.id}`) || '📊'
      }));
      setDashboards(localizedData);
    } catch (error) {
      console.error('Chyba při načítání menu:', error);
    }
  };

  useEffect(() => { loadDashboards(); }, [pathname]);

  const handleAddDashboard = async () => {
    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null); setIsMobileOpen(false);
    const title = prompt('Zadej název pro nové místo:');
    if (!title || !title.trim()) return;
    try {
      const created = await apiCreateDashboard(title.trim());
      await loadDashboards();
      router.push(`/dashboard/${created.id}`);
    } catch (error) { alert('Nepodařilo se vytvořit místo.'); }
  };

  const handleRenameDashboard = async (id: string, currentTitle: string) => {
    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);
    const nextTitle = prompt('Zadej nový název:', currentTitle);
    if (!nextTitle || !nextTitle.trim() || nextTitle.trim() === currentTitle) return;
    try {
      await apiUpdateDashboard(id, { title: nextTitle.trim() });
      await loadDashboards();
      router.refresh();
    } catch (error) { alert('Přejmenování místa selhalo.'); }
  };

  const handleSelectColor = (id: string, hexColor: string) => {
    localStorage.setItem(`theme-color-${id}`, hexColor);
    if (pathname === `/dashboard/${id}`) {
      document.documentElement.style.setProperty('--current-theme-color', hexColor);
      window.dispatchEvent(new CustomEvent('theme-color-changed', { detail: hexColor }));
    }
    setDashboards(prev => prev.map(d => d.id === id ? { ...d, themeColor: hexColor } : d));
    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);
  };

  // 🚀 UKLÁDÁNÍ IKONY: Zapíše emoji do PC a okamžitě zaktualizuje reaktivní pole v RAM
  const handleSelectIcon = (id: string, icon: string) => {
    localStorage.setItem(`theme-icon-${id}`, icon);
    setDashboards(prev => prev.map(d => d.id === id ? { ...d, themeIcon: icon } : d));
    
    // 🚀 LIVE FAVICON SYNC
    if (pathname === `/dashboard/${id}`) {
      window.dispatchEvent(new CustomEvent('theme-icon-changed', { detail: icon }));
    }

    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);
  };

  const handleDuplicateDashboard = async (id: string, title: string) => {
    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);
    try {
      const fullData = await apiFetchFullDashboard(id);
      const clonedWidgets = (fullData.widgets || []).map((w) => ({ ...w, id: crypto.randomUUID() }));
      const newDashboard = await apiCreateDashboard(`${title} (Kopie)`);
      await apiUpdateDashboard(newDashboard.id, { widgets: clonedWidgets });
      
      // Duplikujeme barvu i ikonu do nové paměťové buňky
      localStorage.setItem(`theme-color-${newDashboard.id}`, localStorage.getItem(`theme-color-${id}`) || '#34d399');
      localStorage.setItem(`theme-icon-${newDashboard.id}`, localStorage.getItem(`theme-icon-${id}`) || '📊');

      await loadDashboards();
      router.push(`/dashboard/${newDashboard.id}`);
    } catch (error) { alert('Duplikace selhala.'); }
  };

  const handleExportDashboard = async (id: string, title: string) => {
    if (exporting) return;
    setExporting(true); setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);
    try {
      const fullData = await apiFetchFullDashboard(id);
      const processedWidgets = [];
      for (const widget of fullData.widgets) {
        if (widget.type === 'image' && widget.data?.imageUrl) {
          const url = widget.data.imageUrl;
          if (url.startsWith('/') || url.startsWith('http')) {
            try {
              const base64Data = await fetchUrlToBase64(url);
              processedWidgets.push({ ...widget, data: { ...widget.data, imageUrl: base64Data } });
              continue;
            } catch (err) { console.error(`Chyba přílohy: ${url}`, err); }
          }
        }
        processedWidgets.push(widget);
      }
      triggerFileDownload({
        ...fullData,
        widgets: processedWidgets,
        themeColor: localStorage.getItem(`theme-color-${id}`) || '#34d399',
        themeIcon: localStorage.getItem(`theme-icon-${id}`) || '📊' // Balíme do JSON řetězce
      }, `${title.toLowerCase().replace(/\s+/g, '-')}-backup.json`);
    } catch (error) { alert('Export selhal.'); } finally { setExporting(false); }
  };

  const handleDeleteDashboard = async (id: string, title: string) => {
    if (!window.confirm(`Smazat místo "${title}"?`)) return;
    try {
      await apiDeleteDashboard(id);
      localStorage.removeItem(`theme-color-${id}`);
      localStorage.removeItem(`theme-icon-${id}`);
      await loadDashboards();
      if (pathname === `/dashboard/${id}`) router.push('/');
    } catch (error) { alert('Smazání selhalo.'); }
  };

  const handleImportClick = () => {
    if (importing) return;
    setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed.title) throw new Error("Neplatný formát zálohy.");
          
          const importedDashboard = await apiCreateDashboard(parsed.title);
          const newDashboardId = importedDashboard.id;
          const restoredWidgets = [];

          if (parsed.widgets && Array.isArray(parsed.widgets)) {
            for (const widget of parsed.widgets) {
              if (widget.type === 'image' && widget.data?.imageUrl && widget.data.imageUrl.startsWith('data:image')) {
                try {
                  const restoredFile = base64ToFile(widget.data.imageUrl, `restored-${crypto.randomUUID()}.jpg`);
                  const newServerPath = await apiUploadRestoredFile(restoredFile);
                  restoredWidgets.push({ ...widget, data: { ...widget.data, imageUrl: newServerPath } });
                  continue;
                } catch (err) { console.error("Chyba rekonstrukce foto:", err); }
              }
              restoredWidgets.push(widget);
            }
          }

          await apiUpdateDashboard(newDashboardId, { widgets: restoredWidgets });
          localStorage.setItem(`theme-color-${newDashboardId}`, parsed.themeColor || '#34d399');
          localStorage.setItem(`theme-icon-${newDashboardId}`, parsed.themeIcon || '📊'); // Rozbalení emoji z textu

          await loadDashboards();
          setImporting(false);
          setIsMobileOpen(false);
          router.push(`/dashboard/${newDashboardId}`);
          router.refresh();
        } catch (err) { setImporting(false); alert("Import selhal."); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <button className="sidebar-mobile-trigger" onClick={() => setIsMobileOpen(!isMobileOpen)} title="Otevřít menu">
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {isMobileOpen && <div className="sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`} onClick={() => { setActiveMenuId(null); setColorPickerOpenId(null); setIconPickerOpenId(null); }}>
        <header className="logo-section">
          {!isCollapsed && <h2 className="logo">SilverDashboard</h2>}
          <button 
            className="btn-toggle" 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (isMobileOpen) {
                setIsMobileOpen(false);
              } else {
                setIsCollapsed(!isCollapsed); 
              }
            }}
            title={isMobileOpen ? "Schovat panel" : isCollapsed ? "Rozbalit panel" : "Zmenšit panel"}
          >
            {isMobileOpen ? "✕" : isCollapsed ? "▶" : "◀"}
          </button>
        </header>

        <SidebarNav 
          dashboards={dashboards} pathname={pathname} activeMenuId={activeMenuId} colorPickerOpenId={colorPickerOpenId} iconPickerOpenId={iconPickerOpenId} isCollapsed={isCollapsed}
          onToggleMenu={setActiveMenuId} onToggleColorPicker={setColorPickerOpenId} onToggleIconPicker={setIconPickerOpenId} onSelectColor={handleSelectColor} onSelectIcon={handleSelectIcon}
          onAddClick={handleAddDashboard} onRenameClick={handleRenameDashboard} onDuplicateClick={handleDuplicateDashboard}
          onExportClick={handleExportDashboard} onDeleteClick={handleDeleteDashboard}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <footer className="sidebar-footer">
          <button onClick={handleImportClick} className="btn-sidebar-import" disabled={exporting || importing} title="Importovat zálohu">
            {importing ? '⏳' : exporting ? '⏳' : isCollapsed ? '📤' : '📤 Importovat místo'}
          </button>
        </footer>
      </aside>
    </>
  );
}