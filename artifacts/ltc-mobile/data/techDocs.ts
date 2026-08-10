/**
 * Technical Document Library
 *
 * Documents are sourced from uploaded reference materials and organised by
 * the crane control system they apply to.  Each document lists the sections
 * / chapters extracted from the source, the applicable crane models from the
 * fleet, and the document type so procedures are easy to distinguish
 * from reference material.
 */

export type DocSystem = 'LICCON 1' | 'LICCON 2' | 'ECOS / CCS' | 'Terex / Franna' | 'ZF / WABCO' | 'KATO';
export type DocType =
  | 'Diagnostics'
  | 'Procedure'
  | 'Reference'
  | 'Screen Guide'
  | 'Training';

export type DocSection = {
  ref: string;     // e.g. "20.05" or "Module 03"
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
  /** Fleet model IDs from craneFleet.ts this document applies to */
  appliesTo: string[];
  /** Crane series (broad) for display */
  craneTypes: string[];
  summary: string;
  sections: DocSection[];
  fileName: string;
  /** Clean filename served by the API server at /api/docs/<cleanFile> */
  cleanFile: string;
};

/** Build a full URL to open a document via the API server. */
export function docUrl(doc: TechDoc): string {
  const domain = process.env['EXPO_PUBLIC_DOMAIN'] ?? '';
  const base = domain ? `https://${domain}` : '';
  return `${base}/api/docs/${encodeURIComponent(doc.cleanFile)}`;
}

export const DOC_SYSTEMS: DocSystem[] = ['LICCON 1', 'LICCON 2', 'ECOS / CCS', 'Terex / Franna', 'ZF / WABCO', 'KATO'];

export const SYSTEM_COLORS: Record<DocSystem, string> = {
  'LICCON 1':      '#F7BE21',   // yellow — matches Liebherr
  'LICCON 2':      '#1B9AAA',   // cyan — newer system
  'ECOS / CCS':    '#0055A5',   // Grove blue
  'Terex / Franna':'#E8271A',   // Terex red
  'ZF / WABCO':   '#4A4A4A',   // dark grey — drivetrain
  'KATO':          '#E07B00',   // orange — KATO brand
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
          + 'Power Unit (PU) assignment across chassis and superstructure. Note: actual '
          + 'topology varies by crane model — refer to the crane-specific LSB overview.',
      },
      {
        ref: '20.05',
        title: 'Error Identification — LICCON Computer System',
        summary:
          'Primary error identification procedure. Describes how to read LICCON Error Codes '
          + '(LEC) from the monitor and 7-segment display. Covers monitor errors, basic '
          + 'module errors (unique PU errors, initialisation errors, system errors, fatal '
          + 'system errors), application errors, system errors, and operating errors. '
          + 'Instructs the operator to contact Liebherr customer service if the error '
          + 'cannot be self-resolved.',
      },
      {
        ref: '20.10',
        title: 'Multi-CPU Test System',
        summary:
          'Instructions for using the LICCON Multi-CPU / Multi-ZE / Multi-CU test system '
          + 'to diagnose faults across multiple processing units. Complements the screen '
          + 'simulator document.',
      },
      {
        ref: '20.15',
        title: 'Remote Diagnostics',
        summary:
          'Procedure for connecting to the crane via remote diagnostics link. Allows '
          + 'Liebherr customer service to access the LICCON system remotely for fault '
          + 'analysis. (* = optional equipment)',
      },
      {
        ref: '20.20',
        title: 'Diagnostics — Disk Brake Pads',
        summary:
          'Inspection and diagnostic procedure for disk brake pad wear. Covers visual '
          + 'inspection criteria, measurement points, and replacement triggers.',
      },
      {
        ref: '20.25',
        title: 'Trailing Axle Diagnostics',
        summary:
          'Diagnostic procedure for the trailing axle system. Covers axle raise/lower '
          + 'activation monitoring via LSB and fault identification for trailing axle '
          + 'sensors. (* = optional equipment)',
      },
      {
        ref: '20.30',
        title: 'Test System — TY-Guying',
        summary:
          'Test system for the TY-guying (Y-guying) system. Used to verify the guying '
          + 'geometry sensors and control responses during commissioning or after '
          + 'maintenance.',
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
          + 'with the Level 1 daily access code. The access code is generated from the crane '
          + 'serial number and current date using the LTC daily code algorithm.',
      },
      {
        ref: '—',
        title: 'Available Functions at Level 1',
        summary:
          'Overview of the diagnostic and configuration functions that become available '
          + 'after Level 1 authentication. Includes parameter viewing, sensor calibration '
          + 'initiation, and extended error log access.',
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
      + 'structure, and configuration procedures. This is the primary technical reference '
      + 'for LICCON 2 equipped Liebherr cranes. Scanned original '
      + '(Xerox, 2013).',
    fileName: 'Liccon_2_version_0.4_1786350416190.pdf',
    cleanFile: 'Liccon 2 version 0.4.pdf',
    sections: [
      {
        ref: '—',
        title: 'LICCON 2 System Architecture',
        summary:
          'Overview of the LICCON 2 hardware and software architecture. Describes the '
          + 'updated CAN bus topology, module types, and the relationship between the '
          + 'operator display, CPU units, and sensor/actuator modules.',
      },
      {
        ref: '—',
        title: 'Screen Layout & Navigation',
        summary:
          'Reference for all LICCON 2 display screens available in standard operator mode '
          + 'and service mode. Includes navigation paths, touchscreen interaction model, '
          + 'and menu hierarchy.',
      },
      {
        ref: '—',
        title: 'Parameter Structure',
        summary:
          'Documentation of the LICCON 2 parameter set — parameter IDs, value ranges, '
          + 'units, and access level required to view or modify each parameter.',
      },
      {
        ref: '—',
        title: 'Configuration Procedures',
        summary:
          'Step-by-step configuration procedures for initial commissioning, reeving '
          + 'changes, counterweight variations, and boom/jib configuration changes.',
      },
      {
        ref: '—',
        title: 'Error Codes & Diagnostics',
        summary:
          'LICCON 2 error code reference with descriptions, probable causes, and '
          + 'recommended corrective actions. Covers all LEC (LICCON Error Code) ranges '
          + 'applicable to the LICCON 2 platform.',
      },
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
      + 'document covering maintenance, service procedures, and technical specifications '
      + 'for the GMK 5150L. Captured via Adobe Scan. Applicable to the 150 t, 6-axle '
      + 'GMK 5150L with ECOS/CCS crane control system.',
    fileName: 'GMK_5150L_service_manual_1786372420560.pdf',
    cleanFile: 'GMK 5150L service manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'Full Service Manual (169 pp)',
        summary:
          'Complete scanned service manual for the Grove GMK 5150L. Image-based document — '
          + 'open the PDF to browse maintenance procedures, torque values, hydraulic schematics, '
          + 'and electrical circuit references.',
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
    appliesTo: ['sl-gmk6450', 'sl-gmk6400', 'sl-gmk6300l1', 'sl-gmk6300l', 'sl-gmk6300', 'sl-gmk5250xl1', 'sl-gmk5250l', 'sl-gmk5130', 'sl-gmk4100'],
    craneTypes: ['GMK'],
    summary:
      'Grove / Manitowoc internal technology training presentation covering the full '
      + 'evolution of electronic crane control from relay technology (1996) through to the '
      + 'fully integrated CCS (Crane Control System) platform introduced in 2012. Explains '
      + 'PWM (Pulse Width Modulation) valve control, ESX control units, CAN bus '
      + 'architecture, and the integration of the RCL (Rated Capacity Limiter) into the '
      + 'CCS system. Applicable to all GMK series cranes.',
    fileName: '160829_CH_ECOS_and_CCS_Technology_EN_1786350420447.pptx',
    cleanFile: '160829_CH_ECOS_and_CCS_Technology_EN.pptx',
    sections: [
      {
        ref: 'Module 01',
        title: 'PWM Technology',
        summary:
          'Explains Pulse Width Modulation (PWM) as used to control proportional hydraulic '
          + 'valves. Covers modulation percentages (10 %, 25 %, 50 %, 75 %, 90 %) and how '
          + 'duty-cycle maps to valve opening and crane motion speed.',
      },
      {
        ref: 'Module 02',
        title: 'Initial Test',
        summary:
          'Pre-training assessment / initial test module used to establish technician '
          + 'baseline knowledge.',
      },
      {
        ref: 'Module 03',
        title: 'General Overview',
        summary:
          'Introduction to the two crane operating systems covered: ECOS (Electronic Crane '
          + 'Operating System with ESX) and CCS (Crane Control System). Clarifies that the '
          + 'EKS system and ECOS with EST are not covered.',
      },
      {
        ref: 'Module 04',
        title: 'Introduction — History & Evolution',
        summary:
          'Timeline of Grove crane control evolution:\n'
          + '• 1996 — Relay + analogue technology. Standalone RCL with relay shutdown.\n'
          + '• 1998 — EST-ECOS relay/EST hybrid. RCL communicates via CAN on request.\n'
          + '• 2002 — ESX full-crane control. RCL real-time CAN integration. Software shutdown.\n'
          + '• 2012 — CCS: fully combined control and RCL in a single CAN system.\n'
          + 'Includes circuit diagram walkthrough for GMK 5140 main hoist control (1997).',
      },
      {
        ref: 'Module 05',
        title: 'ECOS — Electronic Crane Operating System',
        summary:
          'Deep dive into the ESX-based ECOS platform used on GMK cranes from 2002. '
          + 'Covers ESX control unit hardware, software architecture, CAN bus topology, '
          + 'and how crane functions are mapped to software modules. Advantages over '
          + 'relay technology: reduced wiring, higher operational safety, continuous I/O '
          + 'monitoring, and complex control via software.',
      },
      {
        ref: 'Module 06',
        title: 'CCS — Crane Control System',
        summary:
          'Current-generation Grove control platform (2012+). Describes the fully '
          + 'integrated CAN control system covering the entire crane. RCL is no longer '
          + 'a standalone system — control and rated-capacity monitoring are combined. '
          + 'Applies to all current GMK models in the fleet.',
      },
    ],
  },

  // ── Terex / Franna ───────────────────────────────────────────────────────

  {
    id: 'franna-hydraulic-diagram',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'Hydraulic Diagram',
    subtitle: 'Franna pick & carry · 8-page schematic',
    pages: 8,
    year: 2026,
    appliesTo: ['fr-at40', 'fr-mac25'],
    craneTypes: ['AT40', 'MAC25'],
    summary:
      'Hydraulic circuit diagram for Terex Franna pick & carry cranes. 8-page schematic '
      + 'covering the complete hydraulic system layout — circuit paths, valve blocks, '
      + 'cylinder feeds, and pressure relief settings. Image-based document; refer to '
      + 'the original PDF for full circuit detail.',
    fileName: 'Hydraulic_diagram_260810_184311_1786351536052.pdf',
    cleanFile: 'Hydraulic diagram_260810_184311.pdf',
    sections: [
      {
        ref: '—',
        title: 'Full Hydraulic Circuit Schematic',
        summary:
          'Complete 8-page hydraulic circuit diagram. Covers all major hydraulic '
          + 'circuits including hoist, boom luffing, slew, and steering. '
          + 'Image-based — view source PDF for circuit tracing.',
      },
    ],
  },

  {
    id: 'franna-at40-electrical',
    system: 'Terex / Franna',
    type: 'Reference',
    title: 'AT40 Electrical Schematic — T172227B',
    subtitle: 'Franna AT40 Production Wiring · Zuken E3 · 57 pages',
    docNumber: 'T172227B',
    pages: 57,
    year: 2023,
    appliesTo: ['fr-at40'],
    craneTypes: ['AT40'],
    summary:
      'Full production electrical schematic for the Terex Franna AT40 (Build 23.10). '
      + 'Created in Zuken E3 Series CAD. 57 A3 pages covering the complete wiring '
      + 'harness, device index, and circuit sheets. Includes chassis electrical — '
      + 'battery, ignition, starter, air tank pressure switches, park brake, emergency '
      + 'steering pump, axle brake pad sensors, lighting circuits (work lights, tail '
      + 'lights, indicators, hazard, side markers, rotary beacon), CRANE/TRAVEL mode '
      + 'switch, and reverse sensor. Proprietary Terex document.',
    fileName: 'C_%5CTEMP%5CDOCS%5CT172227B_1786351581191.pdf',
    cleanFile: 'C_%5CTEMP%5CDOCS%5CT172227B.pdf',
    sections: [
      {
        ref: 'Sheet 4',
        title: 'Power & Starting Circuit',
        summary:
          'Battery (S.No. 1), jump start option (S.No. 2), ignition switch (S.No. 3), '
          + 'and starter motor circuits (S.No. 4 & 5). Main power distribution for '
          + 'chassis and superstructure.',
      },
      {
        ref: 'Sheet 6',
        title: 'Air System & Braking',
        summary:
          'Front and rear air tank pressure switches (S.No. 6 & 7), park brake switch '
          + '(S.No. 8), emergency steering pump 1 (S.No. 9). Air brake circuit monitoring.',
      },
      {
        ref: 'Sheet 11',
        title: 'Axle Brake Pad Sensors',
        summary:
          'Brake pad wear sensors for all axles — Axle 1 LH/RH (S.No. 17 & 18), '
          + 'Axle 2 RH (S.No. 19), Axle 3 LH/RH (S.No. 20 & 21), A1 LH axle (S.No. 22). '
          + 'Feeds brake pad warning system.',
      },
      {
        ref: 'Sheet 16–20',
        title: 'Lighting Circuits',
        summary:
          'Complete lighting harness — tail lights (LH/RH reverse + indicator), '
          + 'supplementary indicators, side markers, boom rotary light, rear worklights, '
          + 'bonnet rotary light, indicator flasher, and hazard switch. '
          + 'Covers S.No. 54–74.',
      },
      {
        ref: 'Device Index',
        title: 'Full Device Index (54+ items)',
        summary:
          'Tabulated index of all electrical devices with schematic sheet/location '
          + 'cross-reference. Use to locate any device by S.No. in the schematic pages.',
      },
    ],
  },

  {
    id: 'liccon-clutch-procedure',
    system: 'LICCON 1',
    type: 'Procedure',
    title: 'AS-Tronic Clutch Test Procedure',
    subtitle: 'LICCON 1 · LICCON 2 Single & Dual Engine',
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'cr-lg1750', 'cr-lr16002', 'cr-ltr1220'],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Step-by-step clutch wear measurement procedure for Liebherr cranes with AS-Tronic '
      + 'gearbox. Covers three variants: LICCON 1, LICCON 2 single-engine, and LICCON 2 '
      + 'dual-engine. Reads the KUPPLUNGSWEG (clutch travel) analogue value via the '
      + 'special system menu and applies a standard calculation to determine clutch '
      + 'condition. Clutch OK: 33–41 mm. Worn: 65–70 mm.',
    fileName: 'leibherr_clutch_procedure_1786351625795.pdf',
    cleanFile: 'leibherr clutch procedure.pdf',
    sections: [
      {
        ref: 'Proc 1',
        title: 'LICCON 1 — Clutch Test',
        summary:
          'With engine running and in operating screen:\n'
          + '1. Press Shift + K simultaneously.\n'
          + '2. Enter day code → press F1.\n'
          + '3. Press I key → F2.\n'
          + '4. Enter access code 039 → press F8 twice → press Enter to return to operating screen.\n'
          + '5. Press I key → arrow keys for English.\n'
          + '6. Press F4 (System Special) → F4 (Other Displays) until page 4 — "binaere messstellan AS-tronic schaltung".\n'
          + '7. Press F1 to scroll to that screen → press Enter.\n'
          + '8. Read line 15: 0.0 > TCU.MV.10 — note the value (e.g. 444).\n'
          + '9. Calculation: value − 82 = X; X ÷ 9.6 = Y mm.\n'
          + '   33–41 mm = clutch OK. 65–70 mm = clutch worn.\n'
          + '10. Press F8 three times to return to operating screen.',
      },
      {
        ref: 'Proc 2',
        title: 'LICCON 2 — Clutch Test (Single Engine)',
        summary:
          'With engine running and in operating screen:\n'
          + '1. Press F1 on R/H armrest → F3 to turn P symbol black.\n'
          + '2. Move crane slightly forward and backward, then into neutral.\n'
          + '3. Press F3 to engage park brake.\n'
          + '4. Press I key → F6 → enter day code → Enter → press crane button.\n'
          + '5. Press Shift + I simultaneously.\n'
          + '6. Find Special System → Enter.\n'
          + '7. Find Special View → Enter.\n'
          + '8. F1 scroll to Control → Enter → F1 scroll to Chassis → Enter.\n'
          + '9. Scroll to Gear AS-Tronic → Enter → Analogue Test Value → Enter.\n'
          + '10. Read KUPPLUNGSWEG value in mm (e.g. 444). If 4 digits, divide by 1000 first.\n'
          + '11. Calculation: value − 82 = X; X ÷ 9.6 = Y mm.\n'
          + '    33–41 mm = clutch OK. 65–70 mm = clutch worn.\n'
          + '12. Press F8 until Special System → press crane button to exit.',
      },
      {
        ref: 'Proc 3',
        title: 'LICCON 2 — Clutch Test (Dual Engine)',
        summary:
          'With top engine running:\n'
          + '1. Start bottom engine from top using touch control unit:\n'
          + '   – Press ignition button (left button, 2nd from bottom on BTT).\n'
          + '   – Press start button (left button, bottom row on BTT).\n'
          + '2. Press F1 on R/H armrest → F3 to turn P symbol black.\n'
          + '3. Move crane slightly forward and backward, then into neutral.\n'
          + '4. Press F3 to engage park brake.\n'
          + '5. Follow same steps as Single Engine (Proc 2) from step 4 onward.\n'
          + '6. Read KUPPLUNGSWEG for each engine unit separately.\n'
          + '7. If 4 digits, divide by 1000 to get mm reading.\n'
          + '   33–41 mm = clutch OK. 65–70 mm = clutch worn.',
      },
      {
        ref: 'Calc',
        title: 'Clutch Wear Calculation Reference',
        summary:
          'Standard formula for all variants:\n'
          + '  Raw value − 82 = intermediate\n'
          + '  Intermediate ÷ 9.6 = clutch travel (mm)\n\n'
          + 'Example: 444 − 82 = 362; 362 ÷ 9.6 = 37.7 mm → Clutch OK.\n\n'
          + 'Thresholds:\n'
          + '  33–41 mm: clutch in good condition\n'
          + '  65–70 mm: clutch worn — schedule replacement\n\n'
          + 'Note: if the raw value is 4 digits (e.g. 3777), divide by 1000 first '
          + 'to convert to mm before applying the formula.',
      },
    ],
  },

  {
    id: 'liccon2-clutch-procedure',
    system: 'LICCON 2',
    type: 'Procedure',
    title: 'AS-Tronic Clutch Test Procedure',
    subtitle: 'LICCON 2 Single & Dual Engine',
    appliesTo: ['sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350', 'cr-lg1750', 'cr-lr16002', 'cr-ltr1220'],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Step-by-step clutch wear measurement procedure for Liebherr cranes with AS-Tronic '
      + 'gearbox on LICCON 2 systems. Covers two variants: single-engine and dual-engine. '
      + 'Navigates to the Special System → Special View → Gear AS-Tronic → Analogue Test Value '
      + 'to read the KUPPLUNGSWEG (clutch travel) value and applies a standard calculation '
      + 'to determine clutch condition. Clutch OK: 33–41 mm. Worn: 65–70 mm.',
    fileName: 'leibherr_clutch_procedure_1786351625795.pdf',
    cleanFile: 'leibherr clutch procedure.pdf',
    sections: [
      {
        ref: 'Proc 2',
        title: 'LICCON 2 — Clutch Test (Single Engine)',
        summary:
          'With engine running and in operating screen:\n'
          + '1. Press F1 on R/H armrest → F3 to turn P symbol black.\n'
          + '2. Move crane slightly forward and backward, then into neutral.\n'
          + '3. Press F3 to engage park brake.\n'
          + '4. Press I key → F6 → enter day code → Enter → press crane button.\n'
          + '5. Press Shift + I simultaneously.\n'
          + '6. Find Special System → Enter.\n'
          + '7. Find Special View → Enter.\n'
          + '8. F1 scroll to Control → Enter → F1 scroll to Chassis → Enter.\n'
          + '9. Scroll to Gear AS-Tronic → Enter → Analogue Test Value → Enter.\n'
          + '10. Read KUPPLUNGSWEG value in mm (e.g. 444). If 4 digits, divide by 1000 first.\n'
          + '11. Calculation: value − 82 = X; X ÷ 9.6 = Y mm.\n'
          + '    33–41 mm = clutch OK. 65–70 mm = clutch worn.\n'
          + '12. Press F8 until Special System → press crane button to exit.',
      },
      {
        ref: 'Proc 3',
        title: 'LICCON 2 — Clutch Test (Dual Engine)',
        summary:
          'With top engine running:\n'
          + '1. Start bottom engine from top using touch control unit:\n'
          + '   – Press ignition button (left button, 2nd from bottom on BTT).\n'
          + '   – Press start button (left button, bottom row on BTT).\n'
          + '2. Press F1 on R/H armrest → F3 to turn P symbol black.\n'
          + '3. Move crane slightly forward and backward, then into neutral.\n'
          + '4. Press F3 to engage park brake.\n'
          + '5. Follow same steps as Single Engine (Proc 2) from step 4 onward.\n'
          + '6. Read KUPPLUNGSWEG for each engine unit separately.\n'
          + '7. If 4 digits, divide by 1000 to get mm reading.\n'
          + '   33–41 mm = clutch OK. 65–70 mm = clutch worn.',
      },
      {
        ref: 'Calc',
        title: 'Clutch Wear Calculation Reference',
        summary:
          'Standard formula for all variants:\n'
          + '  Raw value − 82 = intermediate\n'
          + '  Intermediate ÷ 9.6 = clutch travel (mm)\n\n'
          + 'Example: 444 − 82 = 362; 362 ÷ 9.6 = 37.7 mm → Clutch OK.\n\n'
          + 'Thresholds:\n'
          + '  33–41 mm: clutch in good condition\n'
          + '  65–70 mm: clutch worn — schedule replacement\n\n'
          + 'Note: if the raw value is 4 digits (e.g. 3777), divide by 1000 first '
          + 'to convert to mm before applying the formula.',
      },
    ],
  },

  // ── ZF / WABCO ───────────────────────────────────────────────────────────

  {
    id: 'zf-as-tronic-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'ZF AS-Tronic Operating Manual',
    subtitle: 'Automated manual transmission · Operating & maintenance guide',
    appliesTo: [
      'sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350',
      'cr-lg1750', 'cr-lr16002', 'cr-ltr1220',
    ],
    craneTypes: ['LTM', 'LG', 'LTR'],
    summary:
      'Official ZF AS-Tronic operating and maintenance manual for the automated manual '
      + 'transmission used in Liebherr all-terrain and lattice boom cranes. Covers '
      + 'transmission operation, fault codes, oil change intervals, and service procedures. '
      + 'Essential companion to the LICCON clutch test procedure.',
    fileName: 'ZF-as-Tronic-Operating-Manual.pdf',
    cleanFile: 'ZF-as-Tronic-Operating-Manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'Operating Manual (full document)',
        summary:
          'Complete ZF AS-Tronic operating manual. Open the PDF to browse operating '
          + 'instructions, maintenance schedules, fault code tables, and service procedures.',
      },
    ],
  },

  {
    id: 'wabco-pan19-manual',
    system: 'ZF / WABCO',
    type: 'Reference',
    title: 'WABCO PAN 19 Product Manual',
    subtitle: 'Air brake compressor · Product manual · September 2011',
    year: 2011,
    appliesTo: [
      'sl-ltm1750', 'sl-ltm1650', 'sl-ltm1500', 'sl-ltm1350',
      'sl-gmk6450', 'sl-gmk6400', 'sl-gmk6300l1', 'sl-gmk6300l', 'sl-gmk6300',
    ],
    craneTypes: ['LTM', 'GMK'],
    summary:
      'WABCO PAN 19 product manual covering the air brake compressor fitted to heavy '
      + 'all-terrain crane carriers. Includes installation specifications, maintenance '
      + 'intervals, and troubleshooting for the compressed-air supply system used across '
      + 'Liebherr and Grove all-terrain fleets.',
    fileName: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    cleanFile: 'WABCO-PAN-19_Product-Manual_09-2011.pdf',
    sections: [
      {
        ref: '—',
        title: 'PAN 19 Product Manual (full document)',
        summary:
          'Complete WABCO PAN 19 manual. Open the PDF to browse installation data, '
          + 'maintenance intervals, torque specifications, and fault diagnosis.',
      },
    ],
  },

  // ── KATO ─────────────────────────────────────────────────────────────────

  {
    id: 'kato-acs-ms10e-manual',
    system: 'KATO',
    type: 'Reference',
    title: 'KATO ACS MS-10E Service Manual',
    subtitle: 'Automatic Control System · MS-10E · Service guide',
    appliesTo: [],
    craneTypes: ['KATO'],
    summary:
      'Service manual for the KATO ACS MS-10E (Automatic Control System) crane computer. '
      + 'Covers the MS-10E control unit used on KATO all-terrain and rough-terrain cranes — '
      + 'system overview, parameter access, sensor calibration, fault code tables, and '
      + 'service procedures.',
    fileName: 'KATO ACS MS-10E Service Manual.pdf',
    cleanFile: 'KATO ACS MS-10E Service Manual.pdf',
    sections: [
      {
        ref: '—',
        title: 'ACS MS-10E Service Manual (full document)',
        summary:
          'Complete KATO ACS MS-10E service manual. Open the PDF to browse system '
          + 'architecture, fault codes, calibration procedures, and wiring diagrams.',
      },
    ],
  },
];

export function getBySystem(system: DocSystem): TechDoc[] {
  return TECH_DOCS.filter((d) => d.system === system);
}

export function getByFleetId(fleetId: string): TechDoc[] {
  return TECH_DOCS.filter((d) => d.appliesTo.includes(fleetId));
}
