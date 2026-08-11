import { useState } from 'react';
import type { TemplateKey, TemplateInfo } from '../types/training';
import { TEMPLATE_LIST } from '../types/training';

interface TemplateLibraryProps {
  defaultFtp?: number;
  onSelect: (template: TemplateKey, startDate: string, title?: string) => Promise<void>;
  onCancel: () => void;
}

const goalTypeColors: Record<string, string> = {
  ftp: 'bg-orange-100 text-orange-700',
  endurance: 'bg-blue-100 text-blue-700',
  century: 'bg-green-100 text-green-700',
  gran_fondo: 'bg-purple-100 text-purple-700',
  custom: 'bg-gray-100 text-gray-600',
};

const focusIcons: Record<string, string> = {
  'Aerobic base': '🏔️',
  'FTP / Threshold': '⚡',
  'Long ride endurance': '🚵',
  'Periodized peak performance': '🏆',
};

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: TemplateInfo;
  selected: boolean;
  onSelect: (key: TemplateKey) => void;
}) {
  return (
    <button
      onClick={() => onSelect(template.key)}
      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
        selected ? 'border-primary bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
        <span className="text-base">{focusIcons[template.focus] ?? '📋'}</span>
      </div>
      <p className="mb-2 text-xs text-gray-500">{template.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${goalTypeColors[template.goal_type]}`}
        >
          {template.goal_type}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {template.weeks} weeks
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {template.workouts_per_week}x/week
        </span>
      </div>
    </button>
  );
}

export function TemplateLibrary({ onSelect, onCancel }: TemplateLibraryProps) {
  const [selectedKey, setSelectedKey] = useState<TemplateKey | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7) || 7); // next Monday
    return d.toISOString().split('T')[0];
  });
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplate = TEMPLATE_LIST.find((t) => t.key === selectedKey);

  const handleSubmit = async () => {
    if (!selectedKey || !startDate) return;
    setSubmitting(true);
    try {
      await onSelect(selectedKey, startDate, customTitle.trim() || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Training Plan Templates</h2>
        <p className="mb-4 text-sm text-gray-500">
          Select a template to auto-generate a complete training schedule.
        </p>

        {/* Template grid */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEMPLATE_LIST.map((t) => (
            <TemplateCard
              key={t.key}
              template={t}
              selected={selectedKey === t.key}
              onSelect={setSelectedKey}
            />
          ))}
        </div>

        {/* Config */}
        {selectedTemplate && (
          <div className="mb-4 space-y-3 rounded-lg border border-primary/20 bg-primary-50 p-4">
            <h3 className="text-sm font-medium text-gray-700">
              Configure: {selectedTemplate.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Custom Title (optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={selectedTemplate.title}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              End date: ~{selectedTemplate.weeks} weeks from start • ~
              {selectedTemplate.workouts_per_week * selectedTemplate.weeks} workouts total
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedKey || !startDate || submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
