import { useParams, Link } from 'react-router-dom';
import {
  ActivityDetail,
  ActivityMap,
  ActivityBikeLinker,
  useActivityDetail,
} from '@/features/activity';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activity, loading, error, refetch } = useActivityDetail(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/activities" className="text-sm text-primary hover:text-primary-dark">
          &larr; Back to Activities
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-6">
        <Link to="/activities" className="text-sm text-primary hover:text-primary-dark">
          &larr; Back to Activities
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">Activity not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/activities" className="text-sm text-primary hover:text-primary-dark">
          &larr; Back to Activities
        </Link>
      </div>

      <ActivityDetail activity={activity} />

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">Route Map</h4>
        <ActivityMap encodedPolyline={activity.polyline} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Bike Assignment</h4>
        <ActivityBikeLinker
          activityId={activity.id}
          currentBikeId={activity.bike_id}
          onLinked={refetch}
        />
      </div>
    </div>
  );
}
