import { useState, type ReactNode } from 'react';
import {
  Calculator,
  Ruler,
  Gauge,
  Thermometer,
  Weight,
  RotateCw,
  ArrowRightLeft,
  Building2,
  Wrench,
  KeyRound,
  X,
} from 'lucide-react';
import {
  generateDailyCodes,
  makeLegacyDate,
  type DailyCodeResult,
} from '@/lib/daycodesApi';

type ToolType =
  | 'liccon'
  | 'temperature'
  | 'pressure'
  | 'length'
  | 'weight'
  | 'torque';

const liebherrTools = [
  {
    id: 'liccon' as ToolType,
    title: 'Daily Access Code',
    description: 'LICCON daily access codes from serial + date',
    icon: KeyRound,
  },
];

const engineeringTools = [
  {
    id: 'temperature' as ToolType,
    title: 'Temperature',
    description: 'Convert Celsius, Fahrenheit and Kelvin',
    icon: Thermometer,
  },
  {
    id: 'pressure' as ToolType,
    title: 'Pressure',
    description: 'Convert bar, PSI, kPa and MPa',
    icon: Gauge,
  },
  {
    id: 'length' as ToolType,
    title: 'Length',
    description: 'Convert mm, m, inches and feet',
    icon: Ruler,
  },
  {
    id: 'weight' as ToolType,
    title: 'Weight',
    description: 'Convert kilograms, tonnes and pounds',
    icon: Weight,
  },
  {
    id: 'torque' as ToolType,
    title: 'Torque',
    description: 'Convert Nm, kNm, lb-ft and lb-in',
    icon: RotateCw,
  },
];

/* ------------------------------------------------------------------ */
/* Shared conversion helpers                                           */
/* ------------------------------------------------------------------ */

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }

  const abs = Math.abs(value);
  const digits = abs === 0 ? 0 : abs < 1 ? 6 : abs < 1000 ? 4 : 2;

  return Number(value.toFixed(digits)).toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}

/** Multiplier from each unit to the SI base unit. */
function makeFactorConverter(factors: Record<string, number>) {
  return (value: number, from: string, to: string) =>
    (value * factors[from]) / factors[to];
}

const convertTemperature = (value: number, from: string, to: string) => {
  const kelvin =
    from === 'C' ? value + 273.15
    : from === 'F' ? ((value - 32) * 5) / 9 + 273.15
    : value;

  return to === 'C' ? kelvin - 273.15
    : to === 'F' ? ((kelvin - 273.15) * 9) / 5 + 32
    : kelvin;
};

const convertPressure = makeFactorConverter({
  bar: 100000,
  psi: 6894.757293168,
  kPa: 1000,
  MPa: 1000000,
});

const convertLength = makeFactorConverter({
  mm: 0.001,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
});

const convertWeight = makeFactorConverter({
  kg: 1,
  t: 1000,
  lb: 0.45359237,
});

const convertTorque = makeFactorConverter({
  Nm: 1,
  kNm: 1000,
  lbft: 1.3558179483314004,
  lbin: 0.1129848290276167,
});

/* ------------------------------------------------------------------ */
/* Shared layout pieces                                                */
/* ------------------------------------------------------------------ */

function ConverterLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function ConverterSelectors({
  from,
  to,
  setFrom,
  setTo,
  options,
}: {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          From
        </span>

        <select
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
        aria-label="Swap units"
        className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition hover:bg-secondary/80 hover:text-foreground"
      >
        <ArrowRightLeft className="h-4 w-4" />
      </button>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          To
        </span>

        <select
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function ConverterTool({
  title,
  description,
  options,
  convert,
  initialFrom,
  initialTo,
}: {
  title: string;
  description: string;
  options: [string, string][];
  convert: (value: number, from: string, to: string) => number;
  initialFrom: string;
  initialTo: string;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [input, setInput] = useState('');

  const parsed = Number(input);
  const hasValue = input.trim() !== '' && Number.isFinite(parsed);
  const result = hasValue ? convert(parsed, from, to) : null;

  const unitLabel = (value: string) =>
    options.find(([option]) => option === value)?.[1] ?? value;

  return (
    <ConverterLayout title={title} description={description}>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Value
        </span>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="0"
          inputMode="decimal"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </label>

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={options}
      />

      <div className="rounded-2xl border border-border bg-secondary/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Result
        </p>

        <p className="mt-1 font-mono text-2xl font-bold">
          {result === null ? '—' : formatNumber(result)}{' '}
          <span className="text-base font-semibold text-muted-foreground">
            {unitLabel(to)}
          </span>
        </p>

        {result !== null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(parsed)} {unitLabel(from)} = {formatNumber(result)}{' '}
            {unitLabel(to)}
          </p>
        )}
      </div>
    </ConverterLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Individual tools                                                    */
/* ------------------------------------------------------------------ */

function TemperatureTool() {
  return (
    <ConverterTool
      title="Temperature"
      description="Convert between Celsius, Fahrenheit and Kelvin."
      options={[
        ['C', '°C'],
        ['F', '°F'],
        ['K', 'K'],
      ]}
      convert={convertTemperature}
      initialFrom="C"
      initialTo="F"
    />
  );
}

function PressureTool() {
  return (
    <ConverterTool
      title="Pressure"
      description="Convert between bar, PSI, kPa and MPa."
      options={[
        ['bar', 'bar'],
        ['psi', 'PSI'],
        ['kPa', 'kPa'],
        ['MPa', 'MPa'],
      ]}
      convert={convertPressure}
      initialFrom="bar"
      initialTo="psi"
    />
  );
}

function LengthTool() {
  return (
    <ConverterTool
      title="Length"
      description="Convert between millimetres, metres, inches and feet."
      options={[
        ['mm', 'mm'],
        ['m', 'm'],
        ['in', 'in'],
        ['ft', 'ft'],
      ]}
      convert={convertLength}
      initialFrom="m"
      initialTo="ft"
    />
  );
}

function WeightTool() {
  return (
    <ConverterTool
      title="Weight"
      description="Convert between kilograms, tonnes and pounds."
      options={[
        ['kg', 'kg'],
        ['t', 't'],
        ['lb', 'lb'],
      ]}
      convert={convertWeight}
      initialFrom="kg"
      initialTo="lb"
    />
  );
}

function TorqueTool() {
  return (
    <ConverterTool
      title="Torque"
      description="Convert between Nm, kNm, lb-ft and lb-in."
      options={[
        ['Nm', 'Nm'],
        ['kNm', 'kNm'],
        ['lbft', 'lb-ft'],
        ['lbin', 'lb-in'],
      ]}
      convert={convertTorque}
      initialFrom="Nm"
      initialTo="lbft"
    />
  );
}

function LicconCodeTool() {
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
        serial.trim().length === 0
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
        <h3 className="text-xl font-bold">
          LICCON Daily Access Code
        </h3>

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
              className="shrink-0 rounded-xl bg-secondary px-3 py-2 text-sm font-medium transition hover:bg-secondary/80"
            >
              Today
            </button>
          </div>

          <span className="mt-1 block text-xs text-muted-foreground">
            Must match the date shown on the LICCON display.
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        {isGenerating ? 'Generating…' : 'Generate codes'}
      </button>

      {error && (
        <p className="text-sm font-medium text-destructive">
          {error}
        </p>
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

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const renderTool = () => {
    switch (activeTool) {
      case 'liccon':
        return <LicconCodeTool />;

      case 'temperature':
        return <TemperatureTool />;

      case 'pressure':
        return <PressureTool />;

      case 'length':
        return <LengthTool />;

      case 'weight':
        return <WeightTool />;

      case 'torque':
        return <TorqueTool />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Instrument
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manufacturer utilities and engineering converters.
          </p>
        </div>

        {activeTool && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                aria-label="Close tool"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition hover:bg-secondary/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {renderTool()}
          </div>
        )}

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />

            <h3 className="text-lg font-bold">
              Manufacturer Tools
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Liebherr */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="h-6 w-6" />
              </div>

              <h3 className="font-bold">
                Liebherr
              </h3>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Liebherr crane and LICCON-related tools.
              </p>

              <div className="mt-5 space-y-2">
                {liebherrTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() =>
                        setActiveTool(isActive ? null : tool.id)
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        isActive
                          ? 'bg-primary/10 ring-1 ring-primary'
                          : 'bg-secondary/60 hover:bg-secondary'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-primary" />
                        {tool.title}
                      </span>

                      <span className="text-xs font-semibold text-primary">
                        {isActive ? 'Open' : 'Run'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />

            <h3 className="text-lg font-bold">
              Engineering Calculators
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {engineeringTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(isActive ? null : tool.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-bold">
                    {tool.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
