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
  | 'Mercedes-Benz'
  | 'Dana / Spicer'
  | 'KATO'
  | 'Liebherr'
  | 'Kobelco'
  | 'Eaton'
  | 'SANY';

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
  addedAt?: string;
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
  'Mercedes-Benz',
  'Dana / Spicer',
  'KATO',
  'Liebherr',
  'Kobelco',
  'Eaton',
  'SANY',
];

export const SYSTEM_COLORS: Record<DocSystem, string> = {
  'LICCON 1': '#F7BE21',
  'LICCON 2': '#1B9AAA',
  'ECOS / CCS': '#0055A5',
  'Terex / Franna': '#E8271A',
  'ZF / WABCO': '#4A4A4A',
  'Mercedes-Benz': '#222222',
  'Dana / Spicer': '#005DAA',
  KATO: '#E07B00',
  Liebherr: '#F7BE21',
  Kobelco: '#0067B1',
  Eaton: '#005EB8',
  SANY: '#E31E24',
};

export const SYSTEM_ICONS: Record<DocSystem, string> = {
  'LICCON 1': 'L1',
  'LICCON 2': 'L2',
  'ECOS / CCS': 'EC',
  'Terex / Franna': 'TF',
  'ZF / WABCO': 'ZW',
  'Mercedes-Benz': 'MB',
  'Dana / Spicer': 'DS',
  KATO: 'KT',
  Liebherr: 'LH',
  Kobelco: 'KB',
  Eaton: 'EA',
  SANY: 'SY',
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
      'Service procedure for LICCON 2 service-level access, diagnostic functions '
      + 'and associated service menus.',
    fileName: 'Licon_Two_service_level_one_access._1786350410850.pdf',
    cleanFile: 'Licon Two service level one access..pdf',
    sections: [
      {
        ref: '—',
        title: 'Service Level 1',
        summary:
          'Procedure document covering LICCON 2 service-level access.',
      },
      {
        ref: '—',
        title: 'Available Functions',
        summary:
          'Overview of diagnostic and configuration functions covered by the document.',
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
          'Configuration procedures documented for the LICCON 2 system.',
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
          'Complete scanned service manual for the Grove GMK 5150L.',
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
      'Terex AT40 hydraulic schematic set covering the complete hydraulic system '
      + 'of the AT40 pick & carry crane.',
    fileName: 'Hydraulic diagram_260810_184311.pdf',
    cleanFile: 'Hydraulic diagram_260810_184311.pdf',
    sections: [
      {
        ref: '1',
        title: 'Hydraulic System',
        summary:
          'AT40 hydraulic schematic and system identification.',
      },
      {
        ref: '2',
        title: 'Main Hydraulic System',
        summary:
          'Main hydraulic components, pumps, tank and associated circuits.',
      },
      {
        ref: '3',
        title: 'Suspension & Travel',
        summary:
          'Hydraulic circuits associated with suspension and travel.',
      },
      {
        ref: '4',
        title: 'Steering System',
        summary:
          'AT40 steering hydraulic circuit.',
      },
      {
        ref: '5',
        title: 'Rear Suspension',
        summary:
          'Rear suspension hydraulic manifold and circuits.',
      },
      {
        ref: '6',
        title: 'Telescope & Winch',
        summary:
          'Telescopic cylinder, winch and associated hydraulic circuits.',
      },
      {
        ref: '7',
        title: 'Boom Luffing',
        summary:
          'Boom luffing cylinders and associated hydraulic circuits.',
      },
      {
        ref: '8',
        title: 'Revision Information',
        summary:
          'Drawing revision and change information.',
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
      'Complete Terex AT40 electrical schematic set containing 57 sheets and an '
      + 'indexed circuit and device list. Covers engine, transmission, chassis, '
      + 'crane functions, CAN networks, ABS/WABCO, ZF systems and fuse information.',
    fileName: 'C_%5CTEMP%5CDOCS%5CT172227B.pdf',
    cleanFile: 'C_%5CTEMP%5CDOCS%5CT172227B.pdf',
    sections: [
      {
        ref: '1–3',
        title: 'Electrical Schematic Index',
        summary:
          'Indexed list of AT40 electrical circuits and schematic locations.',
      },
      {
        ref: '4',
        title: 'Battery / Starter / Ignition',
        summary:
          'Battery, starter motor, ignition switch and associated power circuits.',
      },
      {
        ref: '5–10',
        title: 'Engine & Control Systems',
        summary:
          'Engine-related electrical systems, relays, controls and interface circuits.',
      },
      {
        ref: '11–12',
        title: 'Brake & Hydraulic Monitoring',
        summary:
          'Brake-pad, hydraulic filter, articulation, fuel and hydraulic-level circuits.',
      },
      {
        ref: '13–24',
        title: 'Lighting, Cameras & Accessories',
        summary:
          'Lighting, cameras, radio, interior lighting and optional equipment.',
      },
      {
        ref: '25–31',
        title: 'Transmission, E-Stop & Chassis Controls',
        summary:
          'Transmission, emergency-stop, differential lock, exhaust brake and chassis controls.',
      },
      {
        ref: '32–35',
        title: 'Suspension, Axle & Steering Control',
        summary:
          'Suspension, axle, steering and related control circuits.',
      },
      {
        ref: '36–42',
        title: 'Auxiliary Systems & Networks',
        summary:
          'Auxiliary systems, CAN/J1939 networks, diagnostics, joystick and keypad circuits.',
      },
      {
        ref: '43–44',
        title: 'Crane Functions',
        summary:
          'Telescope, luffing, hoist, valve-bank and crane sensor circuits.',
      },
      {
        ref: '45–50',
        title: 'SPU / Body Control Modules',
        summary:
          'Front and rear body SPU connector and control circuits.',
      },
      {
        ref: '51–55',
        title: 'Transmission / ZF / ABS',
        summary:
          'Transmission, ZF and WABCO ABS-related circuits.',
      },
      {
        ref: '56',
        title: 'Fuse List',
        summary:
          'AT40 electrical fuse list.',
      },
      {
        ref: '57',
        title: 'Revision Change Details',
        summary:
          'Electrical schematic revision information.',
      },
    ],
  },

  {
    id: 'robway-franna-rci-1502',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'ROBWAY RCI-1502 Franna Manual',
    subtitle: 'Rated Capacity Indicator · RCI-1502',
    appliesTo: [
      'fr-at40',
      'fr-mac25',
    ],
    craneTypes: ['AT', 'MAC'],
    summary:
      'ROBWAY RCI-1502 rated capacity indicator manual covering system setup, '
      + 'calibration, transducer calibration and system functions.',
    fileName: '602747163-Robway-Franna-Manual-1502.pdf',
    cleanFile: '602747163-Robway-Franna-Manual-1502.pdf',
    sections: [
      {
        ref: '—',
        title: 'RCI-1502 System',
        summary:
          'Overview of the ROBWAY rated capacity indicator system.',
      },
      {
        ref: '5.4',
        title: 'Long Boom Length Calibration',
        summary:
          'Procedure for calibrating long boom length.',
      },
      {
        ref: '5.5',
        title: 'Transducer Calibration',
        summary:
          'Low-end and high-end pressure transducer calibration procedures.',
      },
      {
        ref: '5.7',
        title: 'Calibration Data',
        summary:
          'Procedures for editing and restoring calibration data.',
      },
    ],
  },

  {
    id: 'mac25-3-hydraulic',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'MAC25-3 Hydraulic Section',
    subtitle: 'Terex Franna · Mercedes',
    appliesTo: ['fr-mac25'],
    craneTypes: ['MAC'],
    summary:
      'Hydraulic documentation for the Terex Franna MAC25-3 including hydraulic '
      + 'circuits, winch, telescope, luffing, steering, axle locking and related '
      + 'hydraulic components.',
    fileName: '631741372-MAC25-3-HYDRAULIC-SECTION-MERCEDES-v2-pdf.pdf',
    cleanFile: '631741372-MAC25-3-HYDRAULIC-SECTION-MERCEDES-v2-pdf.pdf',
    sections: [
      {
        ref: '—',
        title: 'Hydraulic System',
        summary:
          'MAC25-3 hydraulic system and component information.',
      },
      {
        ref: '—',
        title: 'Winch',
        summary:
          'Winch hydraulic circuits and associated components.',
      },
      {
        ref: '—',
        title: 'Telescope',
        summary:
          'Primary and secondary telescope hydraulic circuits.',
      },
      {
        ref: '—',
        title: 'Luffing',
        summary:
          'Left and right luffing hydraulic circuits.',
      },
      {
        ref: '—',
        title: 'Axle Locking',
        summary:
          'Hydraulic circuits for axle locking and release.',
      },
    ],
  },

  // ===========================================================================
  // ZF / WABCO
  // ===========================================================================

    {
    id: 'zf-vg750-transfer-case',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'ZF VG 750 Transfer Case Repair Manual',
    subtitle: 'VG 750 · Repair Manual · Edition 1999',
    docNumber: '5871 871 002',
    pages: 72,
    year: 1999,
    appliesTo: [],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'ZF repair manual for the VG 750 transfer case. Covers technical data, '
      + 'cross-sections, exploded views, tightening torques, adjustment data '
      + 'and complete repair procedures.',
    fileName: 'ZF VG750 Transfer Case Repair Manual.pdf',
    cleanFile: 'ZF VG750 Transfer Case Repair Manual.pdf',
    sections: [
      {
        ref: 'Technical Data',
        title: 'Technical Data',
        summary:
          'Technical specifications and reference data for the ZF VG 750 transfer case.',
      },
      {
        ref: 'Cross-Sections',
        title: 'Cross-Sections & Exploded Views',
        summary:
          'Component identification using sectional and exploded-view drawings.',
      },
      {
        ref: 'Torques',
        title: 'Tightening Torques & Adjustment Data',
        summary:
          'Specified tightening torques and adjustment values used during repair.',
      },
      {
        ref: 'Repair',
        title: 'Repair Procedures',
        summary:
          'Disassembly, inspection, repair, adjustment and reassembly procedures.',
      },
    ],
  },
  {
    id: 'zf-as-tronic-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'ZF AS-Tronic Operating Manual',
    subtitle: 'Automated Manual Transmission',
    appliesTo: [
      'sl-ltm1750',
      'sl-ltm1650',
      'sl-ltm1500',
      'sl-ltm1350',
      'sl-gmk6450',
      'sl-gmk6400',
    ],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'Operating and maintenance manual for the ZF AS-Tronic automated manual '
      + 'transmission as fitted to large all-terrain cranes.',
    fileName: 'ZF-as-Tronic-Operating-Manual.pdf',
    cleanFile: 'ZF-as-Tronic-Operating-Manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'System Description',
        summary:
          'Overview of the ZF AS-Tronic transmission system.',
      },
      {
        ref: '—',
        title: 'Operation',
        summary:
          'Driver interface and normal operation procedures.',
      },
      {
        ref: '—',
        title: 'Maintenance',
        summary:
          'Scheduled maintenance and service procedures.',
      },
      {
        ref: '—',
        title: 'Fault Diagnosis',
        summary:
          'Fault codes, diagnostic procedures and corrective actions.',
      },
    ],
  },

  {
    id: 'wabco-pan19-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'WABCO PAN-19 Product Manual',
    subtitle: 'Pneumatic Anti-lock Braking System · September 2011',
    year: 2011,
    appliesTo: [
      'sl-ltm1750',
      'sl-ltm1650',
      'sl-ltm1500',
      'sl-ltm1350',
      'sl-gmk6450',
      'sl-gmk6400',
      'sl-gmk6300l1',
    ],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'WABCO product manual for the PAN-19 pneumatic ABS system.',
    fileName: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    cleanFile: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    sections: [
      {
        ref: '—',
        title: 'System Overview',
        summary:
          'PAN-19 system architecture and components.',
      },
      {
        ref: '—',
        title: 'Installation',
        summary:
          'Mounting and connection requirements.',
      },
      {
        ref: '—',
        title: 'Diagnostics',
        summary:
          'Fault identification and diagnostic procedures.',
      },
    ],
  },

  // ===========================================================================
  // KATO
  // ===========================================================================

  {
    id: 'kato-acs-ms10e',
    system: 'KATO',
    type: 'Reference',
    title: 'KATO ACS MS-10E Service Manual',
    subtitle: 'Aerial Control System',
    appliesTo: [],
    craneTypes: ['KATO'],
    summary:
      'Service manual for the KATO ACS MS-10E Aerial Control System.',
    fileName: 'KATO ACS MS-10E Service Manual.pdf',
    cleanFile: 'KATO ACS MS-10E Service Manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'Full Service Manual',
        summary:
          'Complete service manual for the KATO ACS MS-10E system.',
      },
    ],
  },
    // ===========================================================================
  // MERCEDES-BENZ
  // ===========================================================================

  {
    id: 'mercedes-om904-om906-engine',
    system: 'Mercedes-Benz',
    type: 'Reference',
    title: 'Mercedes-Benz OM 904 LA / OM 906 LA Engine Service Manual',
    subtitle: 'OM 904 LA · OM 906 LA · Engine Service & Repair',
    pages: 398,
    appliesTo: [],
    craneTypes: ['MAC', 'LTM', 'GMK'],
    summary:
      'Comprehensive Mercedes-Benz service and repair manual for the OM 904 LA '
      + 'and OM 906 LA diesel engines. Covers engine technical data, cylinder '
      + 'head, pistons, crankshaft, valve gear, fuel injection, turbocharger, '
      + 'lubrication and cooling systems.',
    fileName: 'Mercedes OM904 OM906 Engine Service Manual.pdf',
    cleanFile: 'Mercedes OM904 OM906 Engine Service Manual.pdf',
    sections: [
      {
        ref: 'Engine',
        title: 'Engine Technical Data',
        summary:
          'Technical specifications and service information for OM 904 LA and OM 906 LA engines.',
      },
      {
        ref: 'Cylinder Head',
        title: 'Cylinder Head & Valve Gear',
        summary:
          'Cylinder head, valves, valve train and associated repair procedures.',
      },
      {
        ref: 'Crankshaft',
        title: 'Crankshaft, Pistons & Connecting Rods',
        summary:
          'Inspection and repair procedures for the crankshaft, pistons and connecting rods.',
      },
      {
        ref: 'Fuel',
        title: 'Fuel Injection System',
        summary:
          'Fuel injection system components, servicing and repair information.',
      },
      {
        ref: 'Turbocharger',
        title: 'Turbocharger',
        summary:
          'Turbocharger inspection, removal, installation and service information.',
      },
      {
        ref: 'Lubrication',
        title: 'Lubrication System',
        summary:
          'Engine lubrication system components and service procedures.',
      },
      {
        ref: 'Cooling',
        title: 'Cooling System',
        summary:
          'Cooling-system components, inspection and repair procedures.',
      },
    ],
  },

  // ===========================================================================
  // DANA / SPICER
  // ===========================================================================

  {
    id: 'spicer-life-series-driveshaft',
    system: 'Dana / Spicer',
    type: 'Reference',
    title: 'Spicer Life Series Driveshaft Service Manual',
    subtitle: 'Life Series 55 · 70 · 90 · 100 · 140 · 170 · 250',
    docNumber: 'DSSM-0100',
    pages: 36,
    year: 2016,
    appliesTo: [],
    craneTypes: ['LTM', 'GMK', 'MAC', 'AT'],
    summary:
      'Spicer Life Series driveshaft service manual covering inspection, '
      + 'lubrication, removal and installation procedures for Life Series '
      + '55, 70, 90, 100, 140, 170 and 250 driveshaft assemblies.',
    fileName: 'Spicer Life Series Driveshaft Service Manual.pdf',
    cleanFile: 'Spicer Life Series Driveshaft Service Manual.pdf',
    sections: [
      {
        ref: 'Inspection',
        title: 'Driveshaft Inspection',
        summary:
          'Inspection procedures for driveshaft assemblies and related components.',
      },
      {
        ref: 'Lubrication',
        title: 'Lubrication',
        summary:
          'Lubrication requirements and service procedures for Spicer Life Series driveshafts.',
      },
      {
        ref: 'Removal',
        title: 'Driveshaft Removal',
        summary:
          'Procedures and precautions for removing driveshaft assemblies.',
      },
      {
        ref: 'Installation',
        title: 'Driveshaft Installation',
        summary:
          'Installation procedures and service requirements for driveshaft assemblies.',
      },
    ],
  },

  // ===========================================================================
  // ENGINE, CRAWLER CRANE & HYDRAULIC SERVICE MANUALS
  // ===========================================================================

  {
    id: 'liebherr-d904-926-engine-service',
    addedAt: '2026-08-15',
    system: 'Liebherr',
    type: 'Reference',
    title: 'Liebherr D904/906, D914/916, D924/926 Diesel Engine Service Manual',
    subtitle: 'Service and repair manual for Liebherr D 904/906, D 914/916 and D 924/926 diesel engines.',
    appliesTo: [],
    craneTypes: ['D904', 'D906', 'D914', 'D916', 'D924', 'D926', 'Liebherr diesel engines'],
    summary:
      'Technical descriptions and service procedures for Liebherr D904, D906, D914, D916, '
      + 'D924 and D926 diesel engines. Covers valve adjustment, cylinder heads, pistons and '
      + 'connecting rods, crankshaft, camshaft and valve drive, lubrication and cooling systems, '
      + 'fuel injection, starter and alternator, maintenance, troubleshooting and special tools.',
    fileName: 'liebherr-d904-906-d914-916-d924-926-service-manual.pdf',
    cleanFile: 'liebherr-d904-906-d914-916-d924-926-service-manual.pdf',
    sections: [
      { ref: 'Engine', title: 'Engine Components', summary: 'Cylinder heads, pistons, connecting rods, crankshaft, camshaft and valve drive.' },
      { ref: 'Systems', title: 'Engine Systems', summary: 'Lubrication, cooling, fuel injection, starter and alternator systems.' },
      { ref: 'Service', title: 'Maintenance & Troubleshooting', summary: 'Valve adjustment, maintenance, fault diagnosis and special-tool information.' },
    ],
  },

  {
    id: 'kobelco-ck1200-cke1100-service',
    addedAt: '2026-08-15',
    system: 'Kobelco',
    type: 'Reference',
    title: 'Kobelco CK1200 / CKE1100 Service Manual',
    subtitle: 'Crawler crane service, adjustment and troubleshooting reference.',
    appliesTo: [],
    craneTypes: ['CK1200', 'CKE1100', 'Kobelco crawler crane'],
    summary:
      'Service manual covering maintenance standards, test procedures, power train, hydraulic, '
      + 'hoist and boom-hoist systems, swing and propel systems, electrical system, troubleshooting, '
      + 'load safety device, adjustments and error-code information.',
    fileName: 'kobelco-ck1200-cke1100-service-manual.pdf',
    cleanFile: 'kobelco-ck1200-cke1100-service-manual.pdf',
    sections: [
      { ref: 'Maintenance', title: 'Maintenance Standards & Tests', summary: 'Maintenance standards, inspection criteria and test procedures.' },
      { ref: 'Systems', title: 'Crane Systems', summary: 'Power train, hydraulics, hoist, boom hoist, swing and propel systems.' },
      { ref: 'Diagnostics', title: 'Electrical & Troubleshooting', summary: 'Electrical system, load safety device, adjustments, error codes and troubleshooting.' },
    ],
  },

  {
    id: 'kobelco-cke1800-ck2000-service',
    addedAt: '2026-08-15',
    system: 'Kobelco',
    type: 'Reference',
    title: 'Kobelco CKE1800 / CK2000 Service Manual',
    subtitle: 'Crawler crane service and troubleshooting manual.',
    appliesTo: [],
    craneTypes: ['CKE1800', 'CK2000', 'Kobelco crawler crane'],
    summary:
      'Service manual covering maintenance standards, power train, hydraulic circuits and '
      + 'components, winch and brake systems, boom hoist, swing and propel systems, electrical '
      + 'schematics, pressure switches and sensors, controller/display system, load safety device '
      + 'and troubleshooting.',
    fileName: 'kobelco-cke1800-ck2000-service-manual.pdf',
    cleanFile: 'kobelco-cke1800-ck2000-service-manual.pdf',
    sections: [
      { ref: 'Hydraulics', title: 'Hydraulic & Mechanical Systems', summary: 'Power train, hydraulic circuits, winch, brakes, boom hoist, swing and propel systems.' },
      { ref: 'Electrical', title: 'Electrical & Control Systems', summary: 'Schematics, switches, sensors, controller/display and load safety device.' },
      { ref: 'Service', title: 'Maintenance & Troubleshooting', summary: 'Maintenance standards and systematic troubleshooting procedures.' },
    ],
  },

  {
    id: 'kobelco-ck2500ii-cke2500ii-service',
    addedAt: '2026-08-15',
    system: 'Kobelco',
    type: 'Reference',
    title: 'Kobelco CK2500-II / CKE2500-II Service Manual',
    subtitle: 'Crawler crane service, adjustment and troubleshooting manual.',
    appliesTo: [],
    craneTypes: ['CK2500-II', 'CKE2500-II', 'Kobelco crawler crane'],
    summary:
      'Service manual covering maintenance standards, engine and pump drive, hydraulic circuits, '
      + 'hoist and brake systems, boom hoist, swing and propel systems, electrical wiring and '
      + 'schematics, controller/display systems, load safety device, troubleshooting and adjustments.',
    fileName: 'kobelco-ck2500ii-cke2500ii-service-manual.pdf',
    cleanFile: 'kobelco-ck2500ii-cke2500ii-service-manual.pdf',
    sections: [
      { ref: 'Drive', title: 'Engine, Pump Drive & Hydraulics', summary: 'Engine and pump drive information plus hydraulic circuits and components.' },
      { ref: 'Crane', title: 'Crane Operating Systems', summary: 'Hoist, brakes, boom hoist, swing and propel systems.' },
      { ref: 'Control', title: 'Electrical, Controls & Diagnostics', summary: 'Wiring, schematics, controller/display systems, load safety device, adjustments and troubleshooting.' },
    ],
  },

  {
    id: 'eaton-pvm-piston-pump-service',
    addedAt: '2026-08-15',
    system: 'Eaton',
    type: 'Reference',
    title: 'Eaton PVM Piston Pump Service Manual',
    subtitle: 'Service, repair and troubleshooting information for Eaton PVM axial piston pumps.',
    appliesTo: [],
    craneTypes: ['PVM018', 'PVM020', 'PVM045', 'PVM050', 'PVM057', 'PVM063', 'PVM074', 'PVM081', 'PVM098', 'PVM106', 'PVM131', 'PVM141'],
    summary:
      'Service reference for Eaton PVM axial piston pumps covering pump construction and operation, '
      + 'control types, parts identification, service parts, disassembly, inspection, repair, assembly, '
      + 'testing, troubleshooting, torque values and required and special tools.',
    fileName: 'eaton-pvm-piston-pump-service-manual.pdf',
    cleanFile: 'eaton-pvm-piston-pump-service-manual.pdf',
    sections: [
      { ref: 'Models', title: 'PVM Pump Range', summary: 'Coverage for PVM018 through PVM141 axial piston pump models.' },
      { ref: 'Repair', title: 'Disassembly, Inspection & Assembly', summary: 'Parts identification, service parts, disassembly, inspection, repair and assembly.' },
      { ref: 'Testing', title: 'Testing & Troubleshooting', summary: 'Operational testing, fault diagnosis, torque values and required tools.' },
    ],
  },

  {
    id: 'sany-crawler-crane-maintenance',
    addedAt: '2026-08-15',
    system: 'SANY',
    type: 'Reference',
    title: 'SANY Crawler Crane Maintenance Manual',
    subtitle: 'Source document contains SCC500E and SCC1000C model references.',
    appliesTo: [],
    craneTypes: ['SCC500E', 'SCC1000C', 'SANY crawler crane'],
    summary:
      'SANY crawler crane maintenance reference covering maintenance safety, service fluids and '
      + 'capacities, lubrication, maintenance schedules, engine and fuel systems, cooling system, '
      + 'air intake, engine-oil servicing and general crane maintenance. The source identifies '
      + 'SCC1000C on its cover and SCC500E in its table of contents.',
    fileName: 'sany-scc500e-crawler-crane-maintenance-manual.pdf',
    cleanFile: 'sany-scc500e-crawler-crane-maintenance-manual.pdf',
    sections: [
      { ref: 'Safety', title: 'Maintenance Safety', summary: 'Safety requirements and precautions for crane servicing.' },
      { ref: 'Schedules', title: 'Fluids, Lubrication & Schedules', summary: 'Service fluids, capacities, lubrication points and maintenance intervals.' },
      { ref: 'Engine', title: 'Engine & General Maintenance', summary: 'Fuel, cooling, air-intake and engine-oil service plus general crane maintenance.' },
    ],
  },

  {
    id: 'mercedes-om904-926-bluetec-operating',
    addedAt: '2026-08-15',
    system: 'Mercedes-Benz',
    type: 'Reference',
    title: 'Mercedes-Benz OM904–926 LA / BlueTec Operating Instructions',
    subtitle: 'Operating, maintenance and technical reference information for Mercedes-Benz OM 904–926 LA engines.',
    appliesTo: [],
    craneTypes: ['OM904', 'OM906', 'OM924', 'OM926', 'OM904 LA', 'OM906 LA', 'OM924 LA', 'OM926 LA', 'BlueTec'],
    summary:
      'Operating instructions covering engine operation, maintenance and care, service products, '
      + 'oil and coolant, engine oil and filter replacement, diagnostics, breakdown assistance, '
      + 'technical data, engine data and capacities, decommissioning and recommissioning.',
    fileName: 'mercedes-om904-926-la-bluetec-operating-instructions.pdf',
    cleanFile: 'mercedes-om904-926-la-bluetec-operating-instructions.pdf',
    sections: [
      { ref: 'Operation', title: 'Engine Operation', summary: 'Normal engine operation, diagnostics and breakdown assistance.' },
      { ref: 'Maintenance', title: 'Maintenance & Service Products', summary: 'Maintenance, care, oil, coolant and oil/filter replacement.' },
      { ref: 'Data', title: 'Technical Data & Storage', summary: 'Engine data, capacities, decommissioning and recommissioning.' },
    ],
  },
];

/**
 * Return all documents that apply to a given fleet model ID.
 */
export function getByFleetId(fleetId: string): TechDoc[] {
  return TECH_DOCS.filter((doc) => doc.appliesTo.includes(fleetId));
    }
