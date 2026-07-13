import fs from 'fs';
import path from 'path';
import { Dashboard } from '../types/dashboard';

// Definice cest k datovým složkám
const DATA_DIR = path.join(process.cwd(), 'data');
const DASHBOARDS_DIR = path.join(DATA_DIR, 'dashboards');

/**
 * Pomocná funkce, která zajistí, že složky pro data existují.
 * Pokud neexistují, vytvoří je.
 */
const ensureDirectoriesExist = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(DASHBOARDS_DIR)) {
    fs.mkdirSync(DASHBOARDS_DIR);
  }
};

/**
 * Uloží nebo aktualizuje pod-dashboard do JSON souboru.
 */
export const saveDashboard = async (dashboard: Dashboard): Promise<void> => {
  ensureDirectoriesExist();
  const filePath = path.join(DASHBOARDS_DIR, `${dashboard.id}.json`);
  
  // Zápis JSONu na disk s formátováním (odsazení 2 mezery) pro lepší čitelnost člověkem
  fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2), 'utf-8');
};

/**
 * Načte jeden konkrétní dashboard podle jeho ID.
 */
export const getDashboard = async (id: string): Promise<Dashboard | null> => {
  ensureDirectoriesExist();
  const filePath = path.join(DASHBOARDS_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent) as Dashboard;
};

/**
 * Načte seznam všech dostupných dashboardů na disku.
 * Použijeme to pro boční panel (Sidebar).
 */
export const getAllDashboards = async (): Promise<Dashboard[]> => {
  ensureDirectoriesExist();
  
  // Přečte všechny soubory ve složce dashboards
  const files = fs.readdirSync(DASHBOARDS_DIR);
  const dashboards: Dashboard[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(DASHBOARDS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      try {
        dashboards.push(JSON.parse(fileContent) as Dashboard);
      } catch (error) {
        console.error(`Chyba při čtení souboru ${file}:`, error);
      }
    }
  }

  // Seřadíme dashboardy podle data vytvoření (od nejnovějšího)
  return dashboards.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Smaže konkrétní dashboard z disku.
 */
export const deleteDashboard = async (id: string): Promise<boolean> => {
  ensureDirectoriesExist();
  const filePath = path.join(DASHBOARDS_DIR, `${id}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};