import React from 'react';
import Sidebar from '../components/Sidebar';
import { FaviconInitializer } from '../components/others/favicon'; // 🚀 Importujeme klientský spouštěč
import './layout.css'; 

export const metadata = {
  title: 'Dashboard',
  description: 'Lokální multi-dashboard v Next.js a TypeScriptu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        <FaviconInitializer emoji="🏠" />

        <div className="app-layout">

          <Sidebar />
          <main className="main-content">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}