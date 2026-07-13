import { NextResponse } from 'next/server';
import { getAllDashboards, saveDashboard } from '../../../lib/storage';
import { Dashboard } from '../../../types/dashboard';

/**
 * GET /api/dashboards
 * Načte a vrátí seznam všech uložených dashboardů.
 */
export async function GET() {
  try {
    const dashboards = await getAllDashboards();
    return NextResponse.json(dashboards, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání dashboardů:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst dashboardy.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboards
 * Vytvoří nový prázdný pod-dashboard.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body;

    // Validace, zda uživatel poslal název
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Název dashboardu je povinný.' },
        { status: 400 }
      );
    }

    // Vygenerujeme unikátní ID z názvu (převedeme na malé a nahradíme mezery pomlčkami)
    // Přidáme náhodné číslo/timestamp, aby bylo ID vždy unikátní
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Odstranění diakritiky
      .replace(/[^a-z0-9]+/g, '-')     // Nahrazení nealfanumerických znaků pomlčkou
      .replace(/(^-|-$)+/g, '');       // Odstranění pomlček na začátku a konci

    const uniqueId = `${slug}-${Date.now().toString().slice(-6)}`;

    // Příprava nového dashboardu podle našeho TypeScript rozhraní
    const newDashboard: Dashboard = {
      id: uniqueId,
      title: title,
      createdAt: Date.now(),
      widgets: [] // Nový dashboard začíná bez widgetů
    };

    // Uložení na disk pomocí naší storage logiky
    await saveDashboard(newDashboard);

    // Vrátíme vytvořený dashboard frontendu
    return NextResponse.json(newDashboard, { status: 201 });
  } catch (error) {
    console.error('Chyba při vytváření dashboardu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit dashboard.' },
      { status: 500 }
    );
  }
}