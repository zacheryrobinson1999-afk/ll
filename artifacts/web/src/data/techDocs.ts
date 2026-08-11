/**
 * Technical Document Library — web version.
 *
 * Same data as the mobile app; docUrl() uses a simple relative path
 * since the web app is served from the same origin as the API.
 */

export type DocSystem =
  | 'LICCON 1'
  | 'LICCON 2'
  | 'ECOS / CCS'
  | 'Terex / Franna'
  | 'ZF / WABCO'
  | 'KATO';

export type DocType =
  | 'Diagnostics'
  | 'Procedure'
  | 'Reference'
  | 'Screen Guide'
  | 'Training';

export type DocSection = {
  ref: string;
  title: string;
  summary: string;
};

export type TechDoc = {
  id: string;
  system: DocSystem;
  type: DocType;
  title: string;
  subtitle: string;
  docNumber?: string;
  pages?: number;
  year?: number;
  appliesTo: string[];
  craneTypes: string[];
  summary: string;
  sections: DocSection[];
  fileName: string;
  cleanFile: string;
};

/**
 * Build a full URL to open a document via the API server.
 */
export function docUrl(doc: TechDoc): string {
  return `/api/docs/${encodeURIComponent(doc.cleanFile)}`;
}

export const DOC_SYSTEMS: DocSystem[] = [
  'LICCON 1',
  'LICCON 2',
  'ECOS / CCS',
  'Terex / Franna',
  'ZF / WABCO',
  'KATO',
];

export const SYSTEM_COLORS: Record<DocSystem, string> = {
  'LICCON 1': '#F7BE21',
  'LICCON 2': '#1B9AAA',
  'ECOS / CCS': '#0055A5',
  'Terex / Franna': '#E8271A',
  'ZF / WABCO': '#4A4A4A',
  KATO: '#E07B00',
};

export const SYSTEM_ICONS: Record<DocSystem, string> = {
  'LICCON 1': 'L1',
  'LICCON 2': 'L2',
  'ECOS / CCS': 'EC',
  'Terex / Franna': 'TF',
  'ZF / WABCO': 'ZW',
  KATO: 'KT',
};

export const TYPE_ICONS: Record<DocType, string> = {
  Diagnostics: 'stethoscope',
  Procedure: 'clipboard-list',
  Reference: 'book-open-variant',
  'Screen Guide': 'monitor',
  Training: 'school',
};

export const TECH_DOCS: TechDoc[] = [
  // ===========================================================================
  // LICCON 1
  // ===========================================================================

  {
    id: 'liccon1-screen-sim',
    system: 'LICCON 1',
    type: 'Screen Guide',
    title: 'LICCON Screen Simulator',
    subtitle: 'Multi-ZE/CU Test System · Version 13.00',
    year: 2001,
    pages: undefined,
    appliesTo: [
      'sl-ltm1500',
      'sl-ltm1350',
      'cr-lr16002',
      'cr-ltr1220',
    ],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Complete screen-by-screen reference for the LICCON 1 Multi-ZE/CU Test System. '
      + 'Covers operator and technician screens available on the LICCON 1 computer in '
      + 'German and English. Includes ZE and CU monitor layouts, system mode selectors, '
      + 'LSB readouts, and data-logger screens.',
    fileName: 'Liebherr_Licon_screen_simulator_1786350396056.pdf',
    cleanFile: 'Liebherr Licon screen simulator.pdf',
    sections: [
      {
        ref: '0.0',
        title: 'System Boot / Start Screen',
        summary:
          'Initial power-on display showing crane model, serial number, system mode, '
          + 'group selection, monitor assignment, hardware/firmware/DATAPROM versions, '
          + 'and language selection.',
      },
      {
        ref: '0.1',
        title: 'Main Menu — SYSTEM',
        summary:
          'Top-level navigation menu including SYSTEM, EPROM Content, CLOCK, '
          + 'SYSTEM SPECIAL, TEST & ERROR and LSB.',
      },
      {
        ref: '0.7',
        title: 'Engine Superstructure — Test Program / Error Stack',
        summary:
          'Engine test program for the superstructure including current error stack entries.',
      },
      {
        ref: '0.8',
        title: 'Set Operating Mode',
        summary:
          'Allows selection of crane operating mode from the LICCON 1 system menu.',
      },
      {
        ref: '0.24',
        title: 'Correction Values — Auto-Mode Cylinder / Tele Free',
        summary:
          'Correction values for the auto-mode cylinder and telescope extend/retract sequence.',
      },
      {
        ref: '0.27',
        title: 'Data Logger — System Control',
        summary:
          'Data logger screen for system-control events.',
      },
      {
        ref: '0.31–0.33',
        title: 'Data Logger — Crane Data 1 / 2 / 3',
        summary:
          'Crane-data logging screens covering load, radius, boom angle and other parameters.',
      },
      {
        ref: '1.1',
        title: 'Set Operating Mode — Level 1',
        summary:
          'Level-1 operating mode selection screen.',
      },
      {
        ref: '2.1',
        title: 'Crane Equipment — Set Operating Mode',
        summary:
          'Crane equipment configuration including SLI mode and operator control stand.',
      },
      {
        ref: '3.4',
        title: 'Boom Locking System — Proximity Switch Position',
        summary:
          'Shows the current switch position of boom-locking proximity switches.',
      },
      {
        ref: '3.5',
        title: 'Boom Locking System — Active on LSB',
        summary:
          'Displays active boom-locking proximity switches on the Liebherr System Bus.',
      },
      {
        ref: '3.6',
        title: 'Boom Locking System — Error Active on LSB',
        summary:
          'Shows proximity switches active on the LSB and reporting an error.',
      },
      {
        ref: '3.8',
        title: 'Telescoping Main Picture — 1 Winch',
        summary:
          'Main telescoping screen for cranes equipped with one winch.',
      },
      {
        ref: '3.13',
        title: 'Telescoping Main Picture — 2 Winches',
        summary:
          'Main telescoping screen for cranes equipped with two winches.',
      },
      {
        ref: 'LSB',
        title: 'LSB — Liebherr System Bus Overview',
        summary:
          'Overview of modules connected to the Liebherr System Bus.',
      },
    ],
  },

  {
    id: 'liccon1-diagnostics',
    system: 'LICCON 1',
    type: 'Diagnostics',
    title: 'LICCON 1 Diagnostics — Operating Instructions',
    subtitle: 'LTM · LG · LTR · BAL-No. 99900-03-02',
    docNumber: '99900-03-02',
    pages: 215,
    year: undefined,
    appliesTo: [
      'sl-ltm1500',
      'sl-ltm1350',
      'sl-gmk6300',
      'cr-lg1750',
      'cr-lr16002',
      'cr-ltr1220',
    ],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Official Liebherr operating instructions for LICCON 1 diagnostics. '
      + 'Covers LSB bus topology, error classification, Multi-CPU testing, remote diagnostics, '
      + 'disk brake diagnostics, trailing axle diagnostics and TY-guying.',
    fileName: 'DIAGNOSTICS_Licon_1_1786350403513.pdf',
    cleanFile: 'DIAGNOSTICS Licon 1.pdf',
    sections: [
      {
        ref: '20.00',
        title: 'Diagnostics — Overview',
        summary:
          'Introduction to LICCON 1 diagnostic functions and error classification.',
      },
      {
        ref: '20.01',
        title: 'Bus System Overview',
        summary:
          'LSB topology, CAN communication, CPU, IPCB and Power Unit assignment.',
      },
      {
        ref: '20.05',
        title: 'Error Identification — LICCON Computer System',
        summary:
          'Procedure for reading LICCON Error Codes and identifying system faults.',
      },
      {
        ref: '20.10',
        title: 'Multi-CPU Test System',
        summary:
          'Using the Multi-CPU / Multi-ZE / Multi-CU test system.',
      },
      {
        ref: '20.15',
        title: 'Remote Diagnostics',
        summary:
          'Procedure for connecting to the crane using remote diagnostics.',
      },
      {
        ref: '20.20',
        title: 'Diagnostics — Disk Brake Pads',
        summary:
          'Inspection and diagnostic procedure for disk brake pad wear.',
      },
      {
        ref: '20.25',
        title: 'Trailing Axle Diagnostics',
        summary:
          'Diagnostic procedure for the trailing axle system.',
      },
      {
        ref: '20.30',
        title: 'Test System — TY-Guying',
        summary:
          'Testing of the TY-guying system and associated sensors.',
      },
    ],
  },

  // ===========================================================================
  // LIEBHERR LICCON CLUTCH CHECK
  // ===========================================================================

  {
    id: 'liebherr-liccon-clutch-check',
    system: 'LICCON 1',
    type: 'Procedure',
    title: 'Liebherr LICCON Clutch Check Procedure',
    subtitle: 'LICCON 1 & LICCON 2 · Clutch Test',
    pages: 4,
    year: undefined,
    appliesTo: [
      'sl-ltm1750',
      'sl-ltm1650',
      'sl-ltm1500',
      'sl-ltm1350',
      'cr-lg1750',
      'cr-lr16002',
      'cr-ltr1220',
    ],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Liebherr LICCON clutch checking procedure covering LICCON 1 and LICCON 2 systems. '
      + 'The supplied procedure contains clutch testing information for Liebherr cranes '
      + 'using the LICCON diagnostic system.',
    fileName: 'leibherr clutch procedure.pdf',
    cleanFile: 'leibherr clutch procedure.pdf',
    sections: [
      {
        ref: 'LICCON 1',
        title: 'LICCON 1 Clutch Check',
        summary:
          'LICCON 1 clutch checking procedure and associated diagnostic screen information.',
      },
      {
        ref: 'LICCON 2',
        title: 'LICCON 2 Clutch Check',
        summary:
          'LICCON 2 clutch checking procedure and associated diagnostic screen information.',
      },
      {
        ref: 'AS-Tronic',
        title: 'AS-Tronic Clutch Measurement',
        summary:
          'Clutch measurement information associated with the AS-Tronic transmission system.',
      },
    ],
  },

  // ===========================================================================
  // LICCON 2
  // ===========================================================================

  {
    id: 'liccon2-service-l1',
    system: 'LICCON 2',
    type: 'Procedure',
    title: 'LICCON 2 — Service Level 1 Access',
    subtitle: 'Service access procedure · 5 pages',
    pages
