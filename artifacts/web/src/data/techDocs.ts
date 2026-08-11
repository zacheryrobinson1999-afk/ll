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

  /*
   * CORRECTED CLUTCH DOCUMENT
   *
   * This was previously incorrectly labelled as:
   * "Franna Clutch Replacement Procedure".
   *
   * The supplied document is actually a Liebherr LICCON clutch CHECK
   * procedure covering both LICCON 1 and LICCON 2.
   */

  {
    id: 'liebherr-liccon-clutch-check',
    system: 'LICCON 1',
    type: 'Procedure',
    title: 'Liebherr LICCON Clutch Check Procedure',
    subtitle: 'LICCON 1 & LICCON 2 · AS-Tronic Clutch Test',
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
      'Liebherr LICCON clutch inspection procedure covering both LICCON 1 and '
      + 'LICCON 2 single-engine cranes. The procedure uses the AS-Tronic clutch '
      + 'measurement value to calculate clutch travel and determine whether the '
      + 'clutch is within the specified check range.',
    fileName: 'leibherr clutch procedure.pdf',
    cleanFile: 'leibherr clutch procedure.pdf',
    sections: [
      {
        ref: 'LICCON 1',
        title: 'LICCON 1 Clutch Test',
        summary:
          'Procedure for entering LICCON 1 service functions and accessing the '
          + 'AS-Tronic binary measurement value used for the clutch check.',
      },
      {
        ref: 'LICCON 1',
        title: 'AS-Tronic Clutch Measurement',
        summary:
          'Uses the value shown under the AS-Tronic measurement screen and applies '
          + 'the documented calculation to determine clutch travel.',
      },
      {
        ref: 'LICCON 2',
        title: 'LICCON 2 Clutch Test — Single Engine',
        summary:
          'Procedure for entering the LICCON 2 special system and navigating to '
          + 'Control → Chassis → Gear AS Tronic → Analogue Test Value.',
      },
      {
        ref: 'LICCON 2',
        title: 'Clutch Travel Calculation',
        summary:
          'Calculate clutch travel from the displayed KUPPLUNGSWEG value using the '
          + 'procedure supplied in the document.',
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
    pages: 5,
    year: 2014,
    appliesTo: [
      'sl-ltm1750',
      'sl-ltm1650',
      'sl-ltm1500',
      'sl-ltm1350',
      'cr-lg1750',
      'cr-lr16002',
    ],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Service procedure for gaining Level 1 service access on the LICCON 2 control system. '
      + 'Level 1 access provides access to service menus, calibration, parameter adjustment '
      + 'and advanced diagnostic screens.',
    fileName: 'Licon_Two_service_level_one_access._1786350410850.pdf',
    cleanFile: 'Licon Two service level one access..pdf',
    sections: [
      {
        ref: '—',
        title: 'Accessing Service Level 1',
        summary:
          'Step-by-step procedure for entering the LICCON 2 service menu and authenticating.',
      },
      {
        ref: '—',
        title: 'Available Functions at Level 1',
        summary:
          'Overview of diagnostic and configuration functions available after authentication.',
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
      'Comprehensive reference document for the LICCON 2 crane control system, '
      + 'covering architecture, screens, parameters and configuration procedures.',
    fileName: 'Liccon_2_version_0.4_1786350416190.pdf',
    cleanFile: 'Liccon 2 version 0.4.pdf',
    sections: [
      {
        ref: '—',
        title: 'LICCON 2 System Architecture',
        summary:
          'Overview of LICCON 2 hardware and software architecture.',
      },
      {
        ref: '—',
        title: 'Screen Layout & Navigation',
        summary:
          'Reference for LICCON 2 display screens and navigation.',
      },
      {
        ref: '—',
        title: 'Parameter Structure',
        summary:
          'Reference for LICCON 2 parameter structures.',
      },
      {
        ref: '—',
        title: 'Configuration Procedures',
        summary:
          'Configuration procedures for commissioning and crane configuration changes.',
      },
      {
        ref: '—',
        title: 'Error Codes & Diagnostics',
        summary:
          'LICCON 2 diagnostic and error-code reference.',
      },
    ],
  },

  // ===========================================================================
  // ECOS / CCS
  // ===========================================================================

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
      'Full service manual for the Grove GMK 5150L all-terrain crane.',
    fileName: 'GMK_5150L_service_manual_1786372420560.pdf',
    cleanFile: 'GMK 5150L service manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'Full Service Manual',
        summary:
          'Complete service manual for the Grove GMK 5150L.',
      },
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
    appliesTo: [
      'sl-gmk6450',
      'sl-gmk6400',
      'sl-gmk6300l1',
      'sl-gmk6300l',
      'sl-gmk6300',
      'sl-gmk5250xl1',
      'sl-gmk5250l',
      'sl-gmk5130',
      'sl-gmk4100',
    ],
    craneTypes: ['GMK'],
    summary:
      'Grove / Manitowoc technology training covering ECOS and CCS crane control systems.',
    fileName: '160829_CH_ECOS_and_CCS_Technology_EN_1786350420447.pptx',
    cleanFile: '160829_CH_ECOS_and_CCS_Technology_EN.pptx',
    sections: [
      {
        ref: 'Module 01',
        title: 'PWM Technology',
        summary:
          'Pulse Width Modulation technology used for proportional hydraulic control.',
      },
      {
        ref: 'Module 02',
        title: 'Initial Test',
        summary:
          'Pre-training assessment.',
      },
      {
        ref: 'Module 03',
        title: 'General Overview',
        summary:
          'Introduction to ECOS and CCS.',
      },
      {
        ref: 'Module 04',
        title: 'Introduction — History & Evolution',
        summary:
          'Evolution of Grove crane control technology.',
      },
      {
        ref: 'Module 05',
        title: 'ECOS — Electronic Crane Operating System',
        summary:
          'Detailed ECOS platform training.',
      },
      {
        ref: 'Module 06',
        title: 'CCS — Crane Control System',
        summary:
          'Detailed CCS platform training.',
      },
      {
        ref: 'Module 07',
        title: 'Assessment',
        summary:
          'End-of-training assessment.',
      },
    ],
  },

  // ===========================================================================
  // TEREX / FRANNA
  // ===========================================================================

  {
    id: 'at40-hydraulic-schematics',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'Terex AT40 Hydraulic Schematics',
    subtitle: 'AT40 Pick & Carry · Drawing T167827 · 8 sheets',
    docNumber: 'T167827',
    pages: 8,
    year: 2020,
    appliesTo: ['fr-at40'],
    craneTypes: ['AT'],
    summary:
      'Terex AT40 hydraulic schematic set covering the complete hydraulic system of '
      + 'the AT40 pick & carry crane. Includes the hydraulic oil tank, emergency steering '
      + 'pumps, variable displacement pump, suspension, steering, telescope, winch, valve '
      + 'bank and boom luffing hydraulic circuits.',
    fileName: 'Hydraulic diagram_260810_184311.pdf',
    cleanFile: 'Hydraulic diagram_260810_184311.pdf',
    sections: [
      {
        ref: '1',
        title: 'Hydraulic System Overview',
        summary:
          'AT40 hydraulic schematic cover and system identification.',
      },
      {
        ref: '2',
        title: 'Main Hydraulic System',
        summary:
          'Hydraulic oil tank, main variable displacement pump, emergency steering pumps '
          + 'and associated hydraulic connections.',
      },
      {
        ref: '3',
        title: 'Suspension & Travel',
        summary:
          'Hydraulic circuits associated with suspension and travel functions.',
      },
      {
        ref: '4',
        title: 'Steering System',
        summary:
          'AT40 steering hydraulic circuit and associated components.',
      },
      {
        ref: '5',
        title: 'Rear Suspension',
        summary:
          'Rear suspension hydraulic manifold and associated circuits.',
      },
      {
        ref: '6',
        title: 'Telescope & Winch',
        summary:
          'Telescopic cylinder, winch motor, brake valve and valve-bank circuits.',
      },
      {
        ref: '7',
        title: 'Boom Luffing',
        summary:
          'Boom luffing cylinders and associated holding/control valves.',
      },
      {
        ref: '8',
        title: 'Revision / Change Information',
        summary:
          'Revision and drawing change information.',
      },
    ],
  },

  {
    id: 'at40-electrical-schematics',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'Terex AT40 Electrical Schematics',
    subtitle: 'AT40 Pick & Carry · Drawing T172227 · 57 sheets',
    docNumber: 'T172227',
    pages: 57,
    year: 2023,
    appliesTo: ['fr-at40'],
    craneTypes: ['AT'],
    summary:
      'Complete Terex AT40 electrical schematic set containing 57 sheets and an indexed '
      + 'circuit/device list. Covers battery and starting circuits, engine controls, '
      + 'Allison transmission, emergency steering, hydraulic monitoring, lighting, '
      + 'CAN networks, joystick and keypad circuits, telescope, luffing, hoist, '
      + 'ABS/WABCO, ZF systems and fuse information.',
    fileName: 'C_%5CTEMP%5CDOCS%5CT172227B.pdf',
    cleanFile: 'C_%5CTEMP%5CDOCS%5CT172227B.pdf',
    sections: [
      {
        ref: '1–3',
        title: 'Electrical Schematic Index',
        summary:
          'Indexed
