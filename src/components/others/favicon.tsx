"use client"; // 🚀 Označujeme soubor jako čistě klientský modul

import { useEffect } from 'react';

// Tvoje původní funkce, netknutá a plně funkční
export function updateFavicon(emoji: string) {
  if (typeof window === 'undefined') return;
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
}

// 🚀 NOVINKA: Klientský React spouštěč pro tvou funkci
export function FaviconInitializer({ emoji }: { emoji: string }) {
  useEffect(() => {
    updateFavicon(emoji);
  }, [emoji]);

  return null; 
}