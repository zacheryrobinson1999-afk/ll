/**
 * Technical Document Library — web version.
 * Same data as the mobile app; docUrl() uses a simple relative path
 * since the web app is served from the same origin as the API.
 */

export type DocSystem = 'LICCON 1' | 'LICCON 2' | 'ECOS / CCS' | 'Terex / Franna' | 'ZF / WABCO' | 'KATO';
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

/** Build a full URL to open a document via the API server. */
export function docUrl(doc: TechDoc): string {
  return `/api/docs/${encodeURIComponent(doc.cleanFile)}`;
}

export const DOC_SYSTEMS: DocSystem[] = ['LICCON 1', 'LICCON 2', 'ECOS / CCS', 'Terex / Franna', 'ZF / WABCO', 'KATO'];

export const SYSTEM_COLORS: Record<DocSystem, string> = {
  'LICCON 1':      '#F7BE21',
  'LICCON 2':      '#1B9AAA',
  'ECOS / CCS':    '#0055A5',
  'Terex / Franna':'#E8271A',
  'ZF / WABCO':   '#4A4A4A',
  'KATO':          '#E07B00',
};

export const SYSTEM_ICONS: Record<DocSystem, string> = {
  'LICCON 1':      'L1',
  'LICCON 2':      'L2',
  'ECOS / CCS':    'EC',
  'Terex / Franna':'TF',
  'ZF / WABCO':   'ZW',
  'KATO':          'KT',
};

export const TYPE_ICONS: Record<DocType, string> = {
  Diagnostics:   'stethoscope',
  Procedure:     'clipboard-list',
  Reference:     'book-open-variant',
  'Screen Guide':'monitor',
  Training:      'school',
};

export const TECH_DOCS: TechDoc[] = [
  // ── LICCON 1 ─────────────────────────────────────────────────────────────

  {
    id: 'liccon1-screen-sim',
    system: 'LICCON 1',
    type: 'Screen Guide',
    title: 'LICCON Screen Simulator',
    subtitle: 'Multi-ZE/CU Test System · Version 13.00',
    year: 2001,
    pages: undefined,
    appliesTo: ['sl-ltm1500', 'sl-ltm1350', 'cr-lr16002', 'cr-ltr1220'],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Complete screen-by-screen reference for the LICCON 1 Multi-ZE/CU Test System. '
      + 'Covers every operator and technician screen available on the LICCON 1 computer in '
      + 'both German and English. Originally produced for the LTM 1200/1 but applicable '
      + 'across the LICCON 1 fleet. Includes ZE (central unit) and CU (control unit) monitor '
      + 'layouts, system mode selectors, LSB readouts, and data-logger screens.',
    fileName: 'Liebherr_Licon_screen_simulator_1786350396056.pdf',
    cleanFile: 'Liebherr Licon screen simulator.pdf',
    sections: [
      {
        ref: '0.0',
        title: 'System Boot / Start Screen',
        summary:
          'Initial power-on display showing crane model, serial number, system mode (0–3), '
          + 'group selection, monitor assignment, hardware/firmware/DATAPROM versions, and '
          + 'language selection (DEUTSCH / ENGLISH).',
      },
      {
        ref: '0.1',
        title: 'Main Menu — SYSTEM',
        summary:
          'Top-level navigation menu with tabs: SYSTEM, EPROM Content, CLOCK, '
          + 'SYSTEM SPECIAL, TEST & ERROR, LSB. Entry point for all diagnostic and '
          + 'configuration functions.',
      },
      {
        ref: '0.7',
        title: 'Engine Superstructure — Test Program / Error Stack',
        summary:
          'Engine test program for the superstructure. Displays current error stack entries '
          + 'and allows the technician to step through stored faults.',
      },
      {
        ref: '0.8',
        title: 'Set Operating Mode',
        summary: 'Allows selection of crane operating mode from the LICCON 1 system menu.',
      },
      {
        ref: '0.24',
        title: 'Correction Values — Auto-Mode Cylinder / Tele Free (Out/In)',
        summary:
          'Displays and edits correction values for the auto-mode cylinder and tele free '
          + '(extend/retract) / stretch sequence. Used during commissioning or after '
          + 'telescope component replacement.',
      },
      {
        ref: '0.27',
        title: 'Data Logger — System Control',
        summary:
          'Optional data-logger screen for system control events. Records timestamped '
          + 'control-system activity for post-incident analysis.',
      },
      {
        ref: '0.31–0.33',
        title: 'Data Logger — Crane Data 1 / 2 / 3',
        summary:
          'Three crane-data data-logger screens logging load, radius, boom angle and '
          + 'other key lift parameters over time.',
      },
      {
        ref: '1.1',
        title: 'Set Operating Mode (Level 1)',
        summary: 'Level-1 operating mode selection screen.',
      },
      {
        ref: '2.1',
        title: 'Crane Equipment — Set Operating Mode (SLI / Control Stand)',
        summary:
          'Sets crane equipment configuration including SLI (Safe Load Indicator) mode '
          + 'and operator control stand assignment.',
      },
      {
        ref: '3.4',
        title: 'Locking System Boom — Proximity Switch (Switch Position)',
        summary:
          'Shows the current switch position of all boom locking proximity switches. '
          + 'Used to verify bolt engagement before and after telescoping.',
      },
      {
        ref: '3.5',
        title: 'Locking System Boom — Proximity Switch (Active on LSB)',
        summary:
          'Displays which boom locking proximity switches are active on the '
          + 'Liebherr System Bus (LSB).',
      },
      {
        ref: '3.6',
        title: 'Locking System Boom — Proximity Switch (With Error Active on LSB)',
        summary:
          'Shows proximity switches that are both active on the LSB and in an error '
          + 'state. Key diagnostic screen for boom locking faults.',
      },
      {
        ref: '3.8',
        title: 'Telescoping Main Picture — 1 Winch',
        summary:
          'Main telescoping operation screen for cranes with a single winch. Displays '
          + 'boom section positions, cylinder pressures, and tele sequence status.',
      },
      {
        ref: '3.13',
        title: 'Telescoping Main Picture — 2 Winches',
        summary:
          'Main telescoping screen for cranes equipped with two winches. Adds second-winch '
          + 'rope tension and position data.',
      },
      {
        ref: 'LSB',
        title: 'LSB (Liebherr System Bus) Overview Screen',
        summary:
          'Shows all modules connected to the LSB (LSB1 through LSBn), including CPU, '
          + 'IPCB, and EP assignments for chassis and superstructure.',
      },
    ],
  },

  {
    id: 'liccon1-diagnostics',
    system: 'LICCON 1',
    type: 'Diagnostics',
    title: 'LICCON 1 Diagnostics — Operating Instructions',
    subtitle: 'LTM · LG · LTR  |  BAL-No. 99900-03-02',
    docNumber: '99900-03-02',
    pages: 215,
    year: undefined,
    appliesTo: ['sl-ltm1500', 'sl-ltm1350', 'sl-gmk6300', 'cr-lg1750', 'cr-lr16002', 'cr-ltr1220'],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Official Liebherr-Werk Ehingen operating instructions for LICCON 1 diagnostics. '
      + 'Covers the full LSB bus topology, error classification and identification, the '
      + 'Multi-CPU test system, remote diagnostics, disk brake diagnostics, trailing-axle '
      + 'diagnostics, and the TY-guying test system. Must be carried with the crane at all '
      + 'times. 215 pages.',
    fileName: 'DIAGNOSTICS_Licon_1_1786350403513.pdf',
    cleanFile: 'DIAGNOSTICS Licon 1.pdf',
    sections: [
      {
        ref: '20.00',
        title: 'Diagnostics — Overview',
        summary:
          'Introduction to the LICCON 1 diagnostic philosophy. Explains how errors are '
          + 'classified (monitor errors, basic module errors, application errors, system '
          + 'errors, operating errors) and the priority order in which the system checks them.',
      },
      {
        ref: '20.01',
        title: 'Bus System Overview',
        summary:
          'Full LSB (Liebherr System Bus) topology diagram for the crane. Explains CAN '
          + '(Controller Area Network) and LSB1–LSBn data transmission, CPU, IPCB, and '
          + 'Power Unit (PU) assignment across chassis and superstructure.',
      },
      {
        ref: '20.05',
        title: 'Error Identification — LICCON Computer System',
        summary:
          'Primary error identification procedure. Describes how to read LICCON Error Codes '
          + '(LEC) from the monitor and 7-segment display. Covers monitor errors, basic '
          + 'module errors, application errors, system errors, and operating errors.',
      },
      {
        ref: '20.10',
        title: 'Multi-CPU Test System',
        summary:
          'Instructions for using the LICCON Multi-CPU / Multi-ZE / Multi-CU test system '
          + 'to diagnose faults across multiple processing units.',
      },
      {
        ref: '20.15',
        title: 'Remote Diagnostics',
        summary:
          'Procedure for connecting to the crane via remote diagnostics link. Allows '
          + 'Liebherr customer service to access the LICCON system remotely for fault analysis.',
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
          'Test system for the TY-guying (Y-guying) system. Used to verify the guying '
          + 'geometry sensors and control responses during commissioning or after maintenance.',
      },
    ],
  },

  // ── LICCON 2 ─────────────────────────────────────────────────────────────

  {
    id: 'liccon2-service-l1',
    system: 'LICCON 2',
    type: 'Procedure',
    title: 'LICCON 2 — Service Level 1 Access',
    subtitle: 'Service access procedure · 5 pages',
    pages: 5,
    year: 2014,
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'cr-lg1750', 'cr-lr16002'],
    craneTypes: ['LTM', 'LG', 'LTR', 'LG'],
    summary:
      'Service procedure document for gaining Level 1 service access on the LICCON 2 '
      + 'control system. Level 1 access unlocks the first tier of service menus beyond '
      + 'standard operator mode, enabling calibration, parameter adjustments and advanced '
      + 'diagnostic screens. This is the daily-code-gated access tier that the LTC '
      + 'daily code generator unlocks. 5 pages. Scanned original (Xerox, 2014).',
    fileName: 'Licon_Two_service_level_one_access._1786350410850.pdf',
    cleanFile: 'Licon Two service level one access..pdf',
    sections: [
      {
        ref: '—',
        title: 'Accessing Service Level 1',
        summary:
          'Step-by-step procedure for entering the LICCON 2 service menu and authenticating '
          + 'with the Level 1 daily access code.',
      },
      {
        ref: '—',
        title: 'Available Functions at Level 1',
        summary:
          'Overview of the diagnostic and configuration functions that become available '
          + 'after Level 1 authentication.',
      },
    ],
  },

  {
    id: 'liccon2-v04',
    system: 'LICCON 2',
    type: 'Reference',
    title: 'LICCON 2 System Reference — Version 0.4',
    subtitle: 'Full system documentation · 287 pages',
    pages: 287,
    year: 2013,
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'cr-lg1750', 'cr-lr16002', 'cr-ltr1220'],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Comprehensive 287-page reference document for the LICCON 2 crane control system '
      + '(version 0.4). Covers the full LICCON 2 architecture, screen layouts, parameter '
      + 'structure, and configuration procedures.',
    fileName: 'Liccon_2_version_0.4_1786350416190.pdf',
    cleanFile: 'Liccon 2 version 0.4.pdf',
    sections: [
      { ref: '—', title: 'LICCON 2 System Architecture', summary: 'Overview of the LICCON 2 hardware and software architecture.' },
      { ref: '—', title: 'Screen Layout & Navigation', summary: 'Reference for all LICCON 2 display screens available in standard operator mode and service mode.' },
      { ref: '—', title: 'Parameter Structure', summary: 'Documentation of the LICCON 2 parameter set — parameter IDs, value ranges, units, and access level required.' },
      { ref: '—', title: 'Configuration Procedures', summary: 'Step-by-step configuration procedures for initial commissioning, reeving changes, and boom/jib configuration changes.' },
      { ref: '—', title: 'Error Codes & Diagnostics', summary: 'LICCON 2 error code reference with descriptions, probable causes, and recommended corrective actions.' },
    ],
  },

  // ── ECOS / CCS ───────────────────────────────────────────────────────────

  {
    id: 'gmk5150l-service-manual',
    system: 'ECOS / CCS',
    type: 'Reference',
    title: 'GMK 5150L Service Manual',
    subtitle: 'Grove All-Terrain · 150 t · 169 pages',
    pages: 169,
    year: 2026,
    appliesTo: ['sl-gmk5150l'],
    craneTypes: ['GMK'],
    summary:
      'Full service manual for the Grove GMK 5150L all-terrain crane. 169-page scanned '
      + 'document covering maintenance, service procedures, and technical specifications.',
    fileName: 'GMK_5150L_service_manual_1786372420560.pdf',
    cleanFile: 'GMK 5150L service manual.pdf',
    sections: [
      { ref: '—', title: 'Full Service Manual (169 pp)', summary: 'Complete scanned service manual for the Grove GMK 5150L.' },
    ],
  },

  {
    id: 'ecos-ccs-training',
    system: 'ECOS / CCS',
    type: 'Training',
    title: 'ECOS & CCS Technology Training',
    subtitle: 'Electronic Crane Operating System · Crane Control System',
    year: 2016,
    pages: undefined,
    appliesTo: ['sl-gmk6450', 'sl-gmk6400', 'sl-gmk6300l1', 'sl-gmk6300l', 'sl-gmk6300', 'sl-gmk5250xl1', 'sl-gmk5250l', 'sl-gmk5130', 'sl-gmk4100'],
    craneTypes: ['GMK'],
    summary:
      'Grove / Manitowoc internal technology training presentation covering the full '
      + 'evolution of electronic crane control from relay technology (1996) through to the '
      + 'fully integrated CCS (Crane Control System) platform introduced in 2012.',
    fileName: '160829_CH_ECOS_and_CCS_Technology_EN_1786350420447.pptx',
    cleanFile: '160829_CH_ECOS_and_CCS_Technology_EN.pptx',
    sections: [
      { ref: 'Module 01', title: 'PWM Technology', summary: 'Explains Pulse Width Modulation (PWM) as used to control proportional hydraulic valves.' },
      { ref: 'Module 02', title: 'Initial Test', summary: 'Pre-training assessment module.' },
      { ref: 'Module 03', title: 'General Overview', summary: 'Introduction to the two crane operating systems: ECOS and CCS.' },
      { ref: 'Module 04', title: 'Introduction — History & Evolution', summary: 'Timeline of Grove crane control evolution from 1996 relay technology through to the 2012 CCS platform.' },
      { ref: 'Module 05', title: 'ECOS — Electronic Crane Operating System', summary: 'Deep dive into the ESX-based ECOS platform used on GMK cranes from 2002.' },
      { ref: 'Module 06', title: 'CCS — Crane Control System', summary: 'Current-generation Grove control platform (2012+). Fully integrated CAN control system covering the entire crane.' },
      { ref: 'Module 07', title: 'Assessment', summary: 'End-of-training assessment covering both ECOS and CCS topics.' },
    ],
  },

  // ── Terex / Franna ────────────────────────────────────────────────────────

  {
    id: 'franna-clutch-procedure',
    system: 'Terex / Franna',
    type: 'Procedure',
    title: 'Franna Clutch Replacement Procedure',
    subtitle: 'Terex Franna AT · MAC Series',
    year: undefined,
    pages: undefined,
    appliesTo: ['fr-at40', 'fr-mac25'],
    craneTypes: ['AT', 'MAC'],
    summary:
      'Clutch removal and replacement procedure for Terex Franna pick-and-carry cranes. '
      + 'Covers the full disassembly sequence, clutch pack inspection, and reassembly '
      + 'torque specifications.',
    fileName: 'leibherr_clutch_procedure_1786350388906.pdf',
    cleanFile: 'leibherr clutch procedure.pdf',
    sections: [
      { ref: '—', title: 'Clutch Removal', summary: 'Step-by-step clutch removal procedure.' },
      { ref: '—', title: 'Inspection & Measurement', summary: 'Clutch pack wear inspection criteria and measurement tolerances.' },
      { ref: '—', title: 'Reassembly & Torque Specs', summary: 'Reassembly sequence with torque specifications for all fasteners.' },
    ],
  },

  // ── ZF / WABCO ───────────────────────────────────────────────────────────

  {
    id: 'zf-as-tronic-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'ZF AS-Tronic Operating Manual',
    subtitle: 'Automated Manual Transmission',
    year: undefined,
    pages: undefined,
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'sl-gmk6450', 'sl-gmk6400'],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'Operating and maintenance manual for the ZF AS-Tronic automated manual '
      + 'transmission as fitted to large all-terrain cranes.',
    fileName: 'ZF-as-Tronic-Operating-Manual.pdf',
    cleanFile: 'ZF-as-Tronic-Operating-Manual.pdf',
    sections: [
      { ref: '—', title: 'System Description', summary: 'Overview of the ZF AS-Tronic automated transmission system.' },
      { ref: '—', title: 'Operation', summary: 'Driver interface and normal operation procedures.' },
      { ref: '—', title: 'Maintenance', summary: 'Scheduled maintenance intervals and procedures.' },
      { ref: '—', title: 'Fault Diagnosis', summary: 'Fault codes, diagnostic procedures, and corrective actions.' },
    ],
  },

  {
    id: 'wabco-pan19-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'WABCO PAN-19 Product Manual',
    subtitle: 'Pneumatic Anti-lock Braking System · September 2011',
    year: 2011,
    pages: undefined,
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'sl-gmk6450', 'sl-gmk6400', 'sl-gmk6300l1'],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'WABCO product manual for the PAN-19 pneumatic ABS system fitted to heavy '
      + 'commercial vehicles and cranes.',
    fileName: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    cleanFile: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    sections: [
      { ref: '—', title: 'System Overview', summary: 'PAN-19 system architecture and components.' },
      { ref: '—', title: 'Installation', summary: 'Mounting and connection requirements.' },
      { ref: '—', title: 'Diagnostics', summary: 'Fault identification and diagnostic procedures.' },
    ],
  },

  // ── KATO ─────────────────────────────────────────────────────────────────

  {
    id: 'kato-acs-ms10e',
    system: 'KATO',
    type: 'Reference',
    title: 'KATO ACS MS-10E Service Manual',
    subtitle: 'Aerial Control System',
    year: undefined,
    pages: undefined,
    appliesTo: [],
    craneTypes: ['KATO'],
    summary:
      'Service manual for the KATO ACS MS-10E Aerial Control System.',
    fileName: 'KATO ACS MS-10E Service Manual.pdf',
    cleanFile: 'KATO ACS MS-10E Service Manual.pdf',
    sections: [
      { ref: '—', title: 'Full Service Manual', summary: 'Complete service manual for the KATO ACS MS-10E system.' },
    ],
  },
];

/** Return all docs that apply to a given fleet model ID. */
export function getByFleetId(fleetId: string): TechDoc[] {
  return TECH_DOCS.filter((doc) => doc.appliesTo.includes(fleetId));
}
