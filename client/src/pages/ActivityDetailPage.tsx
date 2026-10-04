import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ActivityDetail,
  ActivityMap,
  ActivityBikeLinker,
  LapBreakdown,
  ZoneChart,
  TrainingLoadSummary,
  useActivityDetail,
} from '@/features/activity';
import { settingsApi } from '@/features/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import type { UserProfile } from '@/features/settings';

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { activity, loading, error, refetch } = useActivityDetail(id);
  const [tab, setTab] = useState<'overview' | 'training'>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    settingsApi
      .getProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="h-32 animate-pulse rounded-xl bg-secondary" />
        <div className="h-64 animate-pulse rounded-xl bg-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/activities" className="text-sm text-primary hover:text-primary-dark">
          &larr; Back to Activities
        </Link>
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-6">
        <Link to="/activities" className="text-sm text-primary hover:text-primary-dark">
          &larr; Back to Activities
        </Link>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Activity not found.</p>
          </CardContent>
        </Card>
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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(id) => setTab(id as 'overview' | 'training')}>
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div>
            <h4 className="mb-2 text-base font-semibold text-foreground">Route Map</h4>
            <ActivityMap encodedPolyline={activity.polyline} />
          </div>

          <Card>
            <CardContent>
              <h4 className="mb-3 text-base font-semibold text-foreground">Bike Assignment</h4>
              <ActivityBikeLinker
                activityId={activity.id}
                currentBikeId={activity.bike_id}
                onLinked={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div>
            <h4 className="mb-2 text-base font-semibold text-foreground">Training Metrics</h4>
            <TrainingLoadSummary activity={activity} ftp={profile?.ftp ?? null} />
          </div>

          <div>
            <h4 className="mb-2 text-base font-semibold text-foreground">Zone Distribution</h4>
            <ZoneChart activityId={activity.id} />
          </div>

          <div>
            <h4 className="mb-2 text-base font-semibold text-foreground">Lap Breakdown</h4>
            <LapBreakdown activityId={activity.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
