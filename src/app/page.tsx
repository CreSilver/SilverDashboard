import React from 'react';
import { getAllDashboards } from '../lib/storage';
import Link from 'next/link';
import './page.css';

import StatWidget from '../components/widgets/StatWidget';
import TableWidget from '../components/widgets/TableWidget';
import ImageWidget from '../components/widgets/ImageWidget';
import TextWidget from '../components/widgets/TextWidget';
import TimerWidget from '../components/widgets/TimerWidget';
import ProgressWidget from '../components/widgets/ProgressWidget';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🪄 REGISTR: Čisté mapování typů na komponenty
const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  stat: StatWidget,
  table: TableWidget,
  image: ImageWidget,
  text: TextWidget,
  timer: TimerWidget,
  progress: ProgressWidget,
};

// 🎯 1. DATOVÁ ODPOVĚDNOST: Čistá funkce, která pouze filtruje a transformuje pole
function getPinnedWidgets(dashboards: any[]): any[] {
  return dashboards.flatMap((d) =>
    (d.widgets || [])
      .filter((w: any) => w.data?.isPinnedToSummary)
      .map((w: any) => ({ ...w, dashboardTitle: d.title, dashboardId: d.id }))
  );
}

// 🎯 2. ODPOVĚDNOST ZA KARTU: Vykresluje pouze jeden jediný dlaždicový odkaz
function SummaryCard({ widget }: { widget: any }) {
  const WidgetComponent = WIDGET_COMPONENTS[widget.type];

  return (
    <Link href={`/dashboard/${widget.dashboardId}`} className="summary-card">
      <header className="summary-card-header">
        <span className="summary-source-badge">📍 {widget.dashboardTitle}</span>
        <h3 className="summary-card-title">{widget.title}</h3>
      </header>
      
      <div className="summary-chart-box">
        {WidgetComponent ? <WidgetComponent widget={widget} /> : <p style={{ color: '#64748b' }}>Neznámý prvek</p>}
      </div>
    </Link>
  );
}

// 🎯 3. ODPOVĚDNOST ZA SEZNAM: Řeší pouze logiku zobrazení mřížky vs. prázdného stavu
function SummaryGrid({ pinnedWidgets }: { pinnedWidgets: any[] }) {
  if (pinnedWidgets.length === 0) {
    return (
      <div className="summary-empty">
        <p>Žádné metriky zatím nebyly připnuty. Přejdi do libovolného místa a zaškrtni "Připnout na hlavní panel".</p>
      </div>
    );
  }

  return (
    <section className="summary-grid">
      {pinnedWidgets.map((widget) => (
        <SummaryCard key={widget.id} widget={widget} />
      ))}
    </section>
  );
}

// 🎯 4. ODPOVĚDNOST STRÁNKY: Hlavní funkce pouze zatahá data ze storage a složí kostru layoutu
export default async function HomePage() {
  const dashboards = await getAllDashboards() || [];
  const pinnedWidgets = getPinnedWidgets(dashboards);

  return (
    <div className="summary-container">
      <header className="summary-header">
        <h1 className="summary-title">Hlavní přehled</h1>
        <p className="summary-subtitle">Připnuté klíčové metriky ze všech tvých míst</p>
      </header>

      <SummaryGrid pinnedWidgets={pinnedWidgets} />
    </div>
  );
}