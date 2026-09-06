/**
 * Fleet library — crane models.
 * Specs are reference values from manufacturer data sheets.
 * Always verify against the current load chart before any lift.
 */

export type Category = 'Slewer' | 'Crawler' | 'Franna';

export const CATEGORIES: Category[] = ['Slewer', 'Crawler', 'Franna'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Slewer:  '#F7BE21',  // safety yellow
  Crawler: '#1B9AAA',  // cyan
  Franna:  '#E8271A',  // red
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Slewer:  'SL',
  Crawler: 'CR',
  Franna:  'FR',
};

export type CraneModel = {
  id: string;
  category: Category;
  manufacturer: string;
  model: string;
  /** Unit numbers in the fleet */
  units: string[];
  maxCapacity: number;  // tonnes
  maxBoom: number;      // metres (main boom or lattice)
  maxRadius: number;    // metres
  axles: number;        // road axles (0 for crawlers)
  maxTravel: boolean;   // pick & carry capable
  notes: string;
};

export const FLEET: CraneModel[] = [
  // ── Slewer Cranes (All-Terrain Mobile) ───────────────────────────────────

  {
    id: 'sl-ltm1750',
    category: 'Slewer',
    manufacturer: 'Liebherr',
    model: 'LTM 1750-9.1',
    units: [],
    maxCapacity: 800,
    maxBoom: 100,
    maxRadius: 84,
    axles: 9,
    maxTravel: false,
    notes:
      'Flagship 9-axle all-terrain. Carries its full telescopic boom on public roads. VarioBase® asymmetric outrigger system. Broad coverage across industrial, infrastructure and energy sectors.',
  },
  {
    id: 'sl-ltm1650',
    category: 'Slewer',
    manufacturer: 'Liebherr',
    model: 'LTM 1650-8.1',
    units: [],
    maxCapacity: 700,
    maxBoom: 80,
    maxRadius: 80,
    axles: 8,
    maxTravel: false,
    notes:
      'Successor to the LTM 1500-8.1. Maximum on 8 axles — 700 t capacity. Full luffing jib system extends tip height to 152 m. EC-B drive for fuel savings.',
  },
  {
    id: 'sl-ltm1500',
    category: 'Slewer',
    manufacturer: 'Liebherr',
    model: 'LTM 1500-8.1',
    units: [],
    maxCapacity: 500,
    maxBoom: 84,
    maxRadius: 80,
    axles: 8,
    maxTravel: false,
    notes:
      'Best-selling large crane platform. Single-engine LICCON2 control system. Boom booster option for extended reach configurations.',
  },
  {
    id: 'sl-ltm1350',
    category: 'Slewer',
    manufacturer: 'Liebherr',
    model: 'LTM 1350-6.1',
    units: [],
    maxCapacity: 350,
    maxBoom: 70,
    maxRadius: 64,
    axles: 6,
    maxTravel: false,
    notes:
      '6-axle 350 t all-terrain with innovative Y-guying system and optional luffing jib. TY15° guying system for superior lifting performance.',
  },
  {
    id: 'sl-gmk6450',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK6450-1',
    units: [],
    maxCapacity: 450,
    maxBoom: 60,
    maxRadius: 79,
    axles: 6,
    maxTravel: false,
    notes:
      'Strongest heavy-duty 6-axle crane on the market. Max tip height 136 m. MEGATRAK® independent suspension and all-wheel steering for site access.',
  },
  {
    id: 'sl-gmk6400',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK6400',
    units: [],
    maxCapacity: 400,
    maxBoom: 68,
    maxRadius: 72,
    axles: 6,
    maxTravel: false,
    notes:
      '400 t 6-axle with MEGAFORM® boom technology. 68 m main boom and optional 21.3 m luffing jib for high-rise and infrastructure lifts.',
  },
  {
    id: 'sl-gmk6300l1',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK6300L-1',
    units: [],
    maxCapacity: 300,
    maxBoom: 84,
    maxRadius: 78,
    axles: 6,
    maxTravel: false,
    notes:
      'Updated GMK6300L with enhanced lift performance. 84 m main boom — one of the longest in its class. CraneSTAR® telematics as standard.',
  },
  {
    id: 'sl-gmk6300l',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK6300L',
    units: [],
    maxCapacity: 300,
    maxBoom: 84,
    maxRadius: 78,
    axles: 6,
    maxTravel: false,
    notes:
      '300 t all-terrain with 84 m main boom. Proven 6-axle platform used across heavy industrial and infrastructure projects.',
  },
  {
    id: 'sl-gmk6300',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK6300',
    units: [],
    maxCapacity: 300,
    maxBoom: 78,
    maxRadius: 74,
    axles: 6,
    maxTravel: false,
    notes:
      '300 t standard-boom 6-axle all-terrain. Workhorse for heavy structural and plant lifts with strong industry support network.',
  },
  {
    id: 'sl-gmk5250xl1',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK5250XL-1',
    units: [],
    maxCapacity: 250,
    maxBoom: 68,
    maxRadius: 64,
    axles: 5,
    maxTravel: false,
    notes:
      'Extended-boom 5-axle 250 t all-terrain. XL suffix denotes longer main boom for increased reach on high-rise and industrial projects.',
  },
  {
    id: 'sl-gmk5250l',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK5250L',
    units: [],
    maxCapacity: 250,
    maxBoom: 60,
    maxRadius: 56,
    axles: 5,
    maxTravel: false,
    notes:
      '250 t 5-axle all-terrain. 60 m main boom with luffing jib option. Megatrak® suspension for off-road and confined-access sites.',
  },
  {
    id: 'sl-gmk5150l',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK5150L',
    units: [],
    maxCapacity: 150,
    maxBoom: 68,
    maxRadius: 72,
    axles: 5,
    maxTravel: false,
    notes:
      '150 t 5-axle all-terrain. 68 m main boom with luffing jib option. MEGATRAK® '
      + 'independent suspension and all-wheel steering for confined site access. '
      + 'Full service manual available in the reference docs.',
  },
  {
    id: 'sl-gmk5130',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK5130-2',
    units: [],
    maxCapacity: 130,
    maxBoom: 60,
    maxRadius: 56,
    axles: 5,
    maxTravel: false,
    notes:
      '130 t all-terrain. Able to access tight sites where truck cranes used to operate. 60 m main boom + 18 m fly and needle; max tip height 95 m. 5 steerable axles.',
  },
  {
    id: 'sl-gmk4100',
    category: 'Slewer',
    manufacturer: 'Grove',
    model: 'GMK4100',
    units: [],
    maxCapacity: 100,
    maxBoom: 52,
    maxRadius: 48,
    axles: 4,
    maxTravel: false,
    notes:
      'Compact 4-axle 100 t. Single semi-trailer for counterweights. Boom 11.3–52 m; wrap-around fly 10–27 m. Outrigger footprint 8.75 m × 7 m. Max tip height 82 m.',
  },

  // ── Crawler & Other Cranes ───────────────────────────────────────────────

  {
    id: 'cr-lg1750',
    category: 'Crawler',
    manufacturer: 'Liebherr',
    model: 'LG 1750',
    units: [],
    maxCapacity: 750,
    maxBoom: 138,
    maxRadius: 120,
    axles: 0,
    maxTravel: false,
    notes:
      '750 t lattice boom crane. Long undercarriage with crawler pads for heavy industrial and offshore projects. Detachable crawler frames for transport.',
  },
  {
    id: 'cr-lr16002',
    category: 'Crawler',
    manufacturer: 'Liebherr',
    model: 'LR 1600/2 (-W)',
    units: [],
    maxCapacity: 600,
    maxBoom: 126,
    maxRadius: 100,
    axles: 0,
    maxTravel: false,
    notes:
      '600 t lattice boom crawler. Derrick ballast system for high-capacity picks. Wind turbine erection configuration available. Used on major infrastructure projects.',
  },
  {
    id: 'cr-cc28001',
    category: 'Crawler',
    manufacturer: 'Demag',
    model: 'CC2800-1',
    units: [],
    maxCapacity: 600,
    maxBoom: 102,
    maxRadius: 88,
    axles: 0,
    maxTravel: false,
    notes:
      '600 t lattice boom crawler. Modular boom system for versatile rigging. Tray-slewing device for site travel. Proven on petrochemical and heavy industrial lifts.',
  },
  {
    id: 'cr-scc4800a',
    category: 'Crawler',
    manufacturer: 'Sany',
    model: 'SCC4800A',
    units: [],
    maxCapacity: 480,
    maxBoom: 108,
    maxRadius: 96,
    axles: 0,
    maxTravel: false,
    notes:
      '480 t all-terrain crawler. Strong lifting performance across all boom configurations. Suited to wind energy, petrochemical and heavy civil projects.',
  },
  {
    id: 'cr-scc3200t',
    category: 'Crawler',
    manufacturer: 'Sany',
    model: 'SCC3200T',
    units: [],
    maxCapacity: 320,
    maxBoom: 96,
    maxRadius: 84,
    axles: 0,
    maxTravel: false,
    notes:
      '320 t crawler with tower boom configuration available. Multiple units support concurrent multi-crane lifts on large projects.',
  },
  {
    id: 'cr-scc2500a',
    category: 'Crawler',
    manufacturer: 'Sany',
    model: 'SCC2500A',
    units: [],
    maxCapacity: 250,
    maxBoom: 90,
    maxRadius: 78,
    axles: 0,
    maxTravel: false,
    notes:
      '250 t lattice boom crawler. Compact transport dimensions. Suited to confined industrial sites and structural steel erection programs.',
  },
  {
    id: 'cr-cks2500',
    category: 'Crawler',
    manufacturer: 'Kobelco',
    model: 'CKS2500',
    units: [],
    maxCapacity: 250,
    maxBoom: 91,
    maxRadius: 80,
    axles: 0,
    maxTravel: false,
    notes:
      '250 t hydraulic crawler. Max boom 91.4 m; luffing jib up to 61 m. Fixed jib combination 76.2 m + 30.5 m.',
  },
  {
    id: 'cr-ltr1220',
    category: 'Crawler',
    manufacturer: 'Liebherr',
    model: 'LTR 1220',
    units: [],
    maxCapacity: 220,
    maxBoom: 84,
    maxRadius: 72,
    axles: 0,
    maxTravel: false,
    notes:
      '220 t telescopic crawler — combines the site mobility of a crawler with the fast boom of a telescopic crane. Ideal for confined industrial and maintenance lifts.',
  },
  {
    id: 'cr-cks1800',
    category: 'Crawler',
    manufacturer: 'Kobelco',
    model: 'CKS1800',
    units: [],
    maxCapacity: 180,
    maxBoom: 78,
    maxRadius: 66,
    axles: 0,
    maxTravel: false,
    notes:
      '180 t hydraulic crawler. Compact and versatile for medium-capacity structural lifts on restricted sites. Suited to tandem lift operations.',
  },

  // ── Franna Cranes (Pick & Carry) ─────────────────────────────────────────

  {
    id: 'fr-at40',
    category: 'Franna',
    manufacturer: 'Terex Franna',
    model: 'AT40',
    units: [],
    maxCapacity: 40,
    maxBoom: 31,
    maxRadius: 26,
    axles: 4,
    maxTravel: true,
    notes:
      '40 t pick & carry — the largest Franna in the fleet. Purpose-built for structural steel, precast and industrial pick & carry operations. 4WD/4WS for confined site access.',
  },
  {
    id: 'fr-mac25',
    category: 'Franna',
    manufacturer: 'Terex Franna',
    model: 'MAC25',
    units: [],
    maxCapacity: 25,
    maxBoom: 23,
    maxRadius: 20,
    axles: 3,
    maxTravel: true,
    notes:
      '25 t pick & carry — industry leader in its class. Ideal for residential, commercial and industrial sites.',
  },
];

export function getByCategory(category: Category): CraneModel[] {
  return FLEET.filter((c) => c.category === category);
}

export function getByManufacturer(manufacturer: string): CraneModel[] {
  return FLEET.filter(
    (c) => c.manufacturer.toLowerCase() === manufacturer.toLowerCase(),
  );
}

/** Returns unique manufacturer strings present in the fleet, in a stable order. */
export function getManufacturers(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of FLEET) {
    if (!seen.has(c.manufacturer)) {
      seen.add(c.manufacturer);
      out.push(c.manufacturer);
    }
  }
  return out;
}

export function totalUnits(): number {
  return FLEET.reduce((sum, c) => sum + c.units.length, 0);
}
