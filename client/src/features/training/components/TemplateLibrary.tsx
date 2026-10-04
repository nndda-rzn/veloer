import { useState } from 'react';
import {
  Mountain,
  Zap,
  Bike,
  Trophy,
  ClipboardList,
  Dumbbell,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';
import type { TemplateKey, TemplateInfo } from '../types/training';
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

interface TemplateLibraryProps {
  defaultFtp?: number;
  onSelect: (template: TemplateKey, startDate: string, title?: string) => Promise<void>;
  onCancel: () => void;
}

const focusIcons: Record<string, LucideIcon> = {
  'Aerobic base': Mountain,
  'FTP / Threshold': Zap,
  'Long ride endurance': Bike,
  'Periodized peak performance': Trophy,
  'Strength focus': Dumbbell,
  'Balanced strength + cycling': Dumbbell,
  'Endurance with strength': HeartPulse,
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
  const Icon = focusIcons[template.focus] ?? ClipboardList;
  return (
    <button
      onClick={() => onSelect(template.key)}
      aria-pressed={selected}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        selected ? 'border-primary bg-primary-50' : 'border-border bg-card hover:border-input'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{template.title}</h3>
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="mb-2 text-sm text-muted-foreground">{template.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
          {template.goal_type.replace(/_/g, ' ')}
        </span>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
          {template.weeks} weeks
        </span>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Training Plan Templates</DialogTitle>
          <DialogDescription>
            Select a template to auto-generate a complete training schedule.
          </DialogDescription>
        </DialogHeader>

        {/* Template grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary-50 p-4">
            <h3 className="text-base font-medium text-foreground">
              Configure: {selectedTemplate.title}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="template-start">Start Date</Label>
                <Input
                  id="template-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="template-title">Custom Title (optional)</Label>
                <Input
                  id="template-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={selectedTemplate.title}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              End date: ~{selectedTemplate.weeks} weeks from start • ~
              {selectedTemplate.workouts_per_week * selectedTemplate.weeks} workouts total
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedKey || !startDate || submitting}
            loading={submitting}
          >
            {submitting ? 'Generating…' : 'Generate Plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
