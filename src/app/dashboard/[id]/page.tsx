import React from 'react';
import { getDashboard } from '../../../lib/storage';
import DashboardWorkspace from '../../../components/DashboardWorkspace';
import { notFound } from 'next/navigation';

// Vypnutí cache přímo na této vizuální stránce, aby nevznikal Hydration Error
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Serverová komponenta stránky, která přečte data z disku a vykreslí
 * interaktivní klientskou plochu DashboardWorkspace.
 */
export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  if (!dashboard) {
    notFound();
  }

  return <DashboardWorkspace initialData={dashboard} />;
}