import { useState } from 'react';
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
} from 'lucide-react';

type ToolType =
  | 'temperature'
  | 'pressure'
  | 'length'
  | 'weight'
  | 'torque';

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

function NumberInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value"
      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function TemperatureTool() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('C');
  const [to, setTo] = useState('F');

  const number = Number(value);

  let result = '';

  if (value !== '' && Number.isFinite(number)) {
    let celsius = number;

    if (from === 'F') {
      celsius = (number - 32) * (5 / 9);
    }

    if (from === 'K') {
      celsius = number - 273.15;
    }

    if (to === 'C') {
      result = celsius.toFixed(2);
    }

    if (to === 'F') {
      result = (celsius * (9 / 5) + 32).toFixed(2);
    }

    if (to === 'K') {
      result = (celsius + 273.15).toFixed(2);
    }
  }

  return (
    <ConverterLayout
      title="Temperature Converter"
      description="Convert temperature between Celsius, Fahrenheit and Kelvin."
    >
      <NumberInput value={value} onChange={setValue} />

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={[
          ['C', '°C Celsius'],
          ['F', '°F Fahrenheit'],
          ['K', 'K Kelvin'],
        ]}
      />

      <Result
        value={result}
        unit={to === 'C' ? '°C' : to === 'F' ? '°F' : 'K'}
      />
    </ConverterLayout>
  );
}

function PressureTool() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('bar');
  const [to, setTo] = useState('psi');

  const number = Number(value);

  const factors: Record<string, number> = {
    bar: 1,
    psi: 0.0689475729,
    kPa: 0.01,
    MPa: 10,
  };

  let result = '';

  if (value !== '' && Number.isFinite(number)) {
    const bar = number * factors[from];
    result = (bar / factors[to]).toFixed(3);
  }

  return (
    <ConverterLayout
      title="Pressure Converter"
      description="Convert common hydraulic and pneumatic pressure units."
    >
      <NumberInput value={value} onChange={setValue} />

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={[
          ['bar', 'bar'],
          ['psi', 'PSI'],
          ['kPa', 'kPa'],
          ['MPa', 'MPa'],
        ]}
      />

      <Result value={result} unit={to} />
    </ConverterLayout>
  );
}

function LengthTool() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('mm');
  const [to, setTo] = useState('m');

  const factors: Record<string, number> = {
    mm: 0.001,
    m: 1,
    in: 0.0254,
    ft: 0.3048,
  };

  let result = '';

  if (value !== '' && Number.isFinite(Number(value))) {
    const metres = Number(value) * factors[from];
    result = (metres / factors[to]).toFixed(4);
  }

  return (
    <ConverterLayout
      title="Length Converter"
      description="Convert common engineering length measurements."
    >
      <NumberInput value={value} onChange={setValue} />

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={[
          ['mm', 'Millimetres'],
          ['m', 'Metres'],
          ['in', 'Inches'],
          ['ft', 'Feet'],
        ]}
      />

      <Result value={result} unit={to} />
    </ConverterLayout>
  );
}

function WeightTool() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('kg');
  const [to, setTo] = useState('t');

  const factors: Record<string, number> = {
    kg: 1,
    t: 1000,
    lb: 0.45359237,
  };

  let result = '';

  if (value !== '' && Number.isFinite(Number(value))) {
    const kg = Number(value) * factors[from];
    result = (kg / factors[to]).toFixed(4);
  }

  return (
    <ConverterLayout
      title="Weight Converter"
      description="Convert kilograms, tonnes and pounds."
    >
      <NumberInput value={value} onChange={setValue} />

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={[
          ['kg', 'Kilograms'],
          ['t', 'Tonnes'],
          ['lb', 'Pounds'],
        ]}
      />

      <Result value={result} unit={to} />
    </ConverterLayout>
  );
}

function TorqueTool() {
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('Nm');
  const [to, setTo] = useState('Nm');

  const factors: Record<string, number> = {
    Nm: 1,
    kNm: 1000,
    'lb-ft': 1.355817948,
    'lb-in': 0.112984829,
  };

  let result = '';

  if (value !== '' && Number.isFinite(Number(value))) {
    const nm = Number(value) * factors[from];
    result = (nm / factors[to]).toFixed(3);
  }

  return (
    <ConverterLayout
      title="Torque Converter"
      description="Convert torque between Nm, kNm, lb-ft and lb-in."
    >
      <NumberInput value={value} onChange={setValue} />

      <ConverterSelectors
        from={from}
        to={to}
        setFrom={setFrom}
        setTo={setTo}
        options={[
          ['Nm', 'Newton metres'],
          ['kNm', 'Kilonewton metres'],
          ['lb-ft', 'Pound-feet'],
          ['lb-in', 'Pound-inches'],
        ]}
      />

      <Result value={result} unit={to} />
    </ConverterLayout>
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
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          From
        </span>

        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-3 outline-none focus:border-primary"
        >
          {options.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <ArrowRightLeft className="mb-3 h-5 w-5 text-muted-foreground" />

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          To
        </span>

        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-3 outline-none focus:border-primary"
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

function Result({
  value,
  unit,
}: {
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Result
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">
          {value || '—'}
        </span>

        {value && (
          <span className="text-lg text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function ConverterLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
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

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);

  const renderTool = () => {
    switch (activeTool) {
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

        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Calculator className="h-5 w-5" />

            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
              Engineering Tools
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Technician Tools
          </h2>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manufacturer-specific tools and quick engineering calculations
            for the workshop or job site.
          </p>
        </div>

        {activeTool ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="mb-5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              ← All Tools
            </button>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
              {renderTool()}
            </div>
          </>
        ) : (
          <>
            {/* Manufacturer Tools */}
            <section className="mb-10">
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
                    <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
                      <span className="text-sm font-medium">
                        LICCON Tools
                      </span>

                      <span className="text-xs font-semibold text-primary">
                        Available
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Engineering Tools */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />

                <h3 className="text-lg font-bold">
                  Engineering Calculators
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {engineeringTools.map((tool) => {
                  const Icon = tool.icon;

                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setActiveTool(tool.id)}
                      className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
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

                      <div className="mt-5 text-sm font-semibold text-primary">
                        Open tool →
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Footer note */}
        <div className="mt-8 rounded-2xl border border-border bg-card/50 p-5">
          <p className="text-xs leading-5 text-muted-foreground">
            Always verify critical engineering calculations against the
            applicable manufacturer documentation, specifications and site
            requirements before use.
          </p>
        </div>

      </div>
    </div>
  );
}

Then commit that file. No Terex card or Terex code is displayed anywhere on the page.

When you're ready to add the Terex functionality, we can add it behind the existing Manufacturer Tools structure without changing the engineering calculators.
