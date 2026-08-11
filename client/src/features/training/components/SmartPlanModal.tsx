import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Zap, Clock, TrendingUp } from 'lucide-react';
import type { FitnessAnalysis, TemplateKey } from '../types/training';
import { TEMPLATE_LIST } from '../types/training';

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
  high: { label: 'High confidence', color: 'text-green-600', icon: CheckCircle2 },
  low: { label: 'Low confidence', color: 'text-yellow-600', icon: AlertTriangle },
  none: { label: 'No power data', color: 'text-gray-400', icon: AlertTriangle },
};

const goalTypeColors: Record<string, string> = {
  ftp: 'bg-orange-100 text-orange-700',
  endurance: 'bg-blue-100 text-blue-700',
  century: 'bg-green-100 text-green-700',
  gran_fondo: 'bg-purple-100 text-purple-700',
  custom: 'bg-gray-100 text-gray-600',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Smart Plan</h2>
          <p className="text-sm text-gray-500">Based on your Strava activity data</p>
        </div>

        {/* Fitness Analysis Summary */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your Strava Analysis — {analysis.activity_count}{' '}
            {analysis.activity_count === 1 ? 'activity' : 'activities'} synced
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Estimated FTP */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                <span className="text-xs text-gray-500">Est. FTP</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{analysis.estimated_ftp}W</div>
              <div className={`mt-0.5 flex items-center gap-1 text-xs ${confidence.color}`}>
                <ConfidenceIcon className="h-3 w-3" aria-hidden="true" />
                {confidence.label}
              </div>
            </div>

            {/* Weekly Volume */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                <span className="text-xs text-gray-500">Avg/week</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{analysis.avg_weekly_hours}h</div>
              <div className="mt-0.5 text-xs text-gray-400">
                ~{analysis.avg_weekly_tss} TSS/week
              </div>
            </div>

            {/* CTL */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                <span className="text-xs text-gray-500">Fitness (CTL)</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{analysis.ctl}</div>
              <div className="mt-0.5 text-xs text-gray-400">42-day average</div>
            </div>
          </div>

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {analysis.warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2"
                >
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-yellow-700">{warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Plan Config */}
        <div className="mb-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Recommended Plan</h3>

          {/* Template selection */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-600">
              Template
              <span className="ml-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                Recommended:{' '}
                {TEMPLATE_LIST.find((t) => t.key === analysis.suggested_template)?.title}
              </span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TEMPLATE_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplate(t.key)}
                  className={`rounded-lg border-2 p-3 text-left text-sm transition-all ${
                    selectedTemplate === t.key
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900">{t.title}</span>
                    {t.key === analysis.suggested_template && (
                      <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                        Suggested
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${goalTypeColors[t.goal_type]}`}
                    >
                      {t.goal_type}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {t.weeks}w
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {t.workouts_per_week}x/week
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* FTP + Start Date + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                FTP Baseline (W)
              </label>
              <input
                type="number"
                min="1"
                value={ftpBaseline}
                onChange={(e) => setFtpBaseline(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-gray-400">
                Pre-filled from your Strava data — adjust if needed.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Plan Title (optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={selectedTemplateInfo?.title ?? 'My Training Plan'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {selectedTemplateInfo && (
            <p className="text-xs text-gray-400">
              End date: ~{selectedTemplateInfo.weeks} weeks from start • ~
              {selectedTemplateInfo.workouts_per_week * selectedTemplateInfo.weeks} workouts total
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleConfirm()}
            disabled={!startDate || ftpBaseline <= 0 || submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
