"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

// Import všech klientských widgetů
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
import ListWidget from './widgets/ListWidget'; // 🚀 IMPORT WIDGETU

const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  stat: StatWidget,
  table: TableWidget,
  image: ImageWidget,
  text: TextWidget,
  timer: TimerWidget,
  progress: ProgressWidget,
  banner: BannerWidget,
  links: LinksWidget,
  counter: CounterWidget,
  countup: CountUpWidget,
  embed: EmbedWidget,
  list: ListWidget, // 🚀 REGISTR WIDGETU
};

function SummaryCard({ widget }: { widget: any }) {
  const router = useRouter();
  const WidgetComponent = WIDGET_COMPONENTS[widget.type];

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    if (
      target.closest('a') || 
      target.closest('button') || 
      target.closest('select') || 
      target.closest('input')
    ) {
      return;
    }
    
    router.push(`/dashboard/${widget.dashboardId}`);
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="summary-card" 
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <header className="summary-card-header">
        <span className="summary-source-badge">📍 {widget.dashboardTitle}</span>
        <h3 className="summary-card-title">{widget.title}</h3>
      </header>
      
      <div className="summary-chart-box">
        {WidgetComponent ? (
          <WidgetComponent widget={widget} isEditing={false} onCloseEdit={() => {}} />
        ) : (
          <p style={{ color: '#64748b' }}>Neznámý prvek</p>
        )}
      </div>
    </div>
  );
}

export default function SummaryGridClient({ pinnedWidgets }: { pinnedWidgets: any[] }) {
  if (pinnedWidgets.length === 0) {
    return (
      <div className="summary-empty">
        <p>Žádné metriky zatím nebyly připnuty. Přejdi do libovolného místa, klikni na ozubené kolečko `⚙️` a zvol "Připnout".</p>
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