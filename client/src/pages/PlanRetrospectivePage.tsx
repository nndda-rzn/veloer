import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trainingApi } from '@/features/training';
import { PlanRetrospectiveView } from '@/features/training/components/PlanRetrospective';
import type { PlanRetrospective } from '@/features/training';

export function PlanRetrospectivePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PlanRetrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    trainingApi
      .getRetrospective(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load retrospective'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link to="/training-plans" className="text-sm text-primary hover:underline">
          &larr; Training Plans
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/training-plans/${id}`} className="text-sm text-primary hover:underline">
          &larr; Back to Plan
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Plan Retrospective</h1>
      </div>
      <PlanRetrospectiveView data={data} />
    </div>
  );
}
