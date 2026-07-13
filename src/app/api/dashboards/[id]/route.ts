import { NextResponse } from 'next/server';
import { getDashboard, saveDashboard, deleteDashboard } from '../../../../lib/storage';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dashboards/[id]
 * Načte surová data jednoho konkrétního dashboardu podle ID z disku.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dashboard = await getDashboard(id);

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard nebyl nalezen.' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání dashboardu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst dashboard.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/dashboards/[id]
 * Aktualizuje JSON soubor dashboardu na disku (změna pořadí, widgetů atd.).
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingDashboard = await getDashboard(id);
    if (!existingDashboard) {
      return NextResponse.json(
        { error: 'Dashboard nebyl nalezen a nelze ho aktualizovat.' },
        { status: 404 }
      );
    }

    const updatedDashboard = {
      ...existingDashboard,
      title: body.title ?? existingDashboard.title,
      widgets: body.widgets ?? existingDashboard.widgets,
    };

    await saveDashboard(updatedDashboard);

    return NextResponse.json(updatedDashboard, { status: 200 });
  } catch (error) {
    console.error('Chyba při aktualizaci dashboardu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se uložit změny.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboards/[id]
 * Fyzicky smaže JSON soubor dashboardu z disku.
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteDashboard(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Dashboard nebyl nalezen a nebylo možné ho smazat.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Dashboard byl úspěšně odstraněn.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při mazání dashboardu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se smazat dashboard.' },
      { status: 500 }
    );
  }
}