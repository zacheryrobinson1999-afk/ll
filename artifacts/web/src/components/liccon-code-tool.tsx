import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import {
  generateDailyCodes,
  makeLegacyDate,
  type DailyCodeResult,
} from '@/lib/daycodesApi';

export function LicconCodeTool() {
  const [serial, setSerial] = useState('');
  const [date, setDate] = useState(() => makeLegacyDate());
  const [codes, setCodes] = useState<DailyCodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const dateValid = /^\d{6}$/.test(date);
  const canGenerate = serial.trim().length > 0 && dateValid;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setCodes(null);
      setError(
        !serial.trim()
          ? 'Enter the LICCON serial number.'
          : 'Date must be 6 digits in DDMMYY format.',
      );
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      setCodes(await generateDailyCodes(serial, date));
    } catch (generationError) {
      setCodes(null);
      setError(generationError instanceof Error ? generationError.message : 'Unable to generate daycodes.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold">LICCON Daily Access Code</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Enter the control-unit serial number and the date shown on the
          display to generate the two daily access codes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Serial number
          </span>

          <input
            value={serial}
            onChange={(event) => setSerial(event.target.value)}
            placeholder="e.g. 123456"
            inputMode="numeric"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Date (DDMMYY)
          </span>

          <div className="flex gap-2">
            <input
              value={date}
              onChange={(event) =>
                setDate(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="DDMMYY"
              inputMode="numeric"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />

            <button
              type="button"
              onClick={() => setDate(makeLegacyDate())}
              className="shrink-0 rounded-xl bg-secondary px-3 py-2 text-sm font-medium"
            >
              Today
            </button>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        {isGenerating ? 'Generating…' : 'Generate codes'}
      </button>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      {codes && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'First code', value: codes.first },
            { label: 'Second code', value: codes.second },
          ].map((entry) => (
            <div
              key={entry.label}
              className="rounded-2xl border border-border bg-secondary/60 p-4 text-center"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {entry.label}
              </p>

              <p className="mt-1 font-mono text-3xl font-bold tracking-[0.25em]">
                {entry.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
