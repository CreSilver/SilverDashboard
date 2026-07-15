import React from 'react';
import { getAllDashboards } from '../lib/storage'; // 🚀 Bezpečný serverový Node.js disk import
import SummaryGridClient from '../components/SummaryGridClient'; // 🚀 Import nového klientského wrapperu
import './page.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getPinnedWidgets(dashboards: any[]): any[] {
  return dashboards.flatMap((d) =>
    (d.widgets || [])
      .filter((w: any) => w.isPinnedToSummary === true || w.data?.isPinnedToSummary === true)
      .map((w: any) => ({ ...w, dashboardTitle: d.title, dashboardId: d.id }))
  );
}

export default async function HomePage() {
  const dashboards = await getAllDashboards() || [];
  const pinnedWidgets = getPinnedWidgets(dashboards);

  return (
    <div className="summary-container">
      <header className="summary-header">
        <h1 className="summary-title">Hlavní přehled</h1>
        <p className="summary-subtitle">Připnuté klíčové metriky ze všech tvých míst</p>
      </header>

      {/* 🚀 Odesíláme čistá JSON data přes hranici server/klient. Žádné funkce, vše projde bezpečně. */}
      <SummaryGridClient pinnedWidgets={pinnedWidgets} />
    </div>
  );
}