import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react';
import type { FitnessAnalysis, TemplateKey } from '../types/training';
import { TEMPLATE_LIST } from '../types/training';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SmartPlanModalProps {
  analysis: FitnessAnalysis;
  defaultFtp: number;
  onConfirm: (
    template: TemplateKey,
    startDate: string,
    ftpBaseline: number,
    title?: string,
  ) => Promise<void>;
  onCancel: () => void;
}

const confidenceConfig = {
  high: { label: 'High confidence', color: 'text-success', icon: CheckCircle2 },
  low: { label: 'Low confidence', color: 'text-warning', icon: AlertTriangle },
  none: { label: 'No power data', color: 'text-muted-foreground', icon: AlertTriangle },
};

export function SmartPlanModal({ analysis, defaultFtp, onConfirm, onCancel }: SmartPlanModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(
    analysis.suggested_template,
  );
  const [ftpBaseline, setFtpBaseline] = useState(
    analysis.ftp_confidence !== 'none' ? analysis.suggested_ftp_baseline : defaultFtp,
  );
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7) || 7); // next Monday
    return d.toISOString().split('T')[0];
  });
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplateInfo = TEMPLATE_LIST.find((t) => t.key === selectedTemplate);
  const confidence = confidenceConfig[analysis.ftp_confidence];
  const ConfidenceIcon = confidence.icon;

  const handleConfirm = async () => {
    if (!startDate || ftpBaseline <= 0) return;
    setSubmitting(true);
    try {
      await onConfirm(selectedTemplate, startDate, ftpBaseline, customTitle.trim() || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Smart Plan</DialogTitle>
          <DialogDescription>Based on your Strava activity data</DialogDescription>
        </DialogHeader>

        {/* Fitness Analysis Summary */}
        <div className="rounded-xl border border-border bg-secondary p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Strava Analysis · {analysis.activity_count}{' '}
            {analysis.activity_count === 1 ? 'activity' : 'activities'} synced
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Estimated FTP */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">Est. FTP</span>
              </div>
              <div className="text-xl font-mono font-semibold tabular-nums text-foreground">
                {analysis.estimated_ftp}W
              </div>
              <div className={`mt-0.5 flex items-center gap-1 text-xs ${confidence.color}`}>
                <ConfidenceIcon className="h-3 w-3" aria-hidden="true" />
                {confidence.label}
              </div>
            </div>

            {/* Weekly Volume */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">Avg/week</span>
              </div>
              <div className="text-xl font-mono font-semibold tabular-nums text-foreground">
                {analysis.avg_weekly_hours}h
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                ~{analysis.avg_weekly_tss} TSS/week
              </div>
            </div>

            {/* CTL */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">Fitness (CTL)</span>
              </div>
              <div className="text-xl font-mono font-semibold tabular-nums text-foreground">
                {analysis.ctl}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">42-day average</div>
            </div>
          </div>

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {analysis.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                >
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-amber-800">{warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Plan Config */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Recommended Plan</h3>

          {/* Template selection */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Template
              <span className="ml-1.5 rounded bg-primary-50 px-1.5 py-0.5 text-xs text-primary-700">
                Recommended:{' '}
                {TEMPLATE_LIST.find((t) => t.key === analysis.suggested_template)?.title}
              </span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TEMPLATE_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplate(t.key)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    selectedTemplate === t.key
                      ? 'border-primary bg-primary-50'
                      : 'border-border bg-card hover:border-input'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{t.title}</span>
                    {t.key === analysis.suggested_template && (
                      <span className="shrink-0 rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                        Suggested
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {t.goal_type.replace(/_/g, ' ')}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {t.weeks}w
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {t.workouts_per_week}x/week
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* FTP + Start Date + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ftp-baseline">FTP Baseline (W)</Label>
              <Input
                id="ftp-baseline"
                type="number"
                min="1"
                value={ftpBaseline}
                onChange={(e) => setFtpBaseline(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Pre-filled from your Strava data. Adjust if needed.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plan-title">Plan Title (optional)</Label>
            <Input
              id="plan-title"
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={selectedTemplateInfo?.title ?? 'My Training Plan'}
            />
          </div>

          {selectedTemplateInfo && (
            <p className="text-xs text-muted-foreground">
              End date: ~{selectedTemplateInfo.weeks} weeks from start • ~
              {selectedTemplateInfo.workouts_per_week * selectedTemplateInfo.weeks} workouts total
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            disabled={!startDate || ftpBaseline <= 0 || submitting}
            loading={submitting}
          >
            {submitting ? 'Creating…' : 'Create Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
