import type { TechDoc } from './techDocs';

// Five manuals verified in Backblaze on 2026-09-06. Keep source applicability limits.
export const VERIFIED_MANUAL_DOCS = [
  {
    "id": "import-liebherr-liccon2-diagnostics-ee9da985ad374a04",
    "system": "LICCON 2",
    "type": "Diagnostics",
    "title": "LICCON 2 Diagnostics Manual - Operating Instructions",
    "summary": "Liebherr LICCON 2 diagnostic operating instructions covering fault alignment, error stacks, defective components, Liebherr System Bus, BTT and BSE test systems, telematics, remote diagnostics and disk brake pad diagnostics. The source names no specific crane model and is valid only with the supplied crane operating instructions. Metadata notes: Specific applicable crane models and serial number are not stated. No separately labelled whole-document revision; do not infer revision 02 from BAL number. 2024 is the printed copyright year; cover issue date is blank.",
    "sections": [
      {
        "ref": "PDF p. 13",
        "title": "20.01 Procedure in case of problems",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 49",
        "title": "20.04 Overview Bus system",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 55",
        "title": "20.09 BTT test system",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 81",
        "title": "20.10 BSE test system",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 119",
        "title": "20.15 Telematic data and remote diagnostics",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 127",
        "title": "20.20 Diagnostics – Disk brake pads",
        "summary": "Source heading; consult the cited PDF page and following section."
      }
    ],
    "manufacturer": "Liebherr",
    "sourceSystem": "LICCON 2 / LSB / BTT / BSE",
    "documentType": "Diagnostics manual",
    "preparedFilename": "Liebherr_LICCON2_Diagnostics-Manual_99908-03-02_2024.pdf",
    "subtitle": "Diagnostics manual | LICCON 2; specific models unspecified",
    "pages": 135,
    "appliesTo": [],
    "craneTypes": [],
    "fileName": "Liebherr_LICCON2_Diagnostics-Manual_99908-03-02_2024.pdf",
    "cleanFile": "Liebherr_LICCON2_Diagnostics-Manual_99908-03-02_2024.pdf",
    "year": 2024,
    "docNumber": "99908-03-02"
  },
  {
    "id": "import-liebherr-ltm-1060-3-1-errors-f53813768c2547d2",
    "system": "LICCON 2",
    "type": "Diagnostics",
    "title": "LTM 1060-3.1 LICCON Error Code Manual",
    "summary": "Machine-associated LICCON error-code reference for LTM 1060-3.1, identifier 040601. Lists fault text, system reaction, corrective action, connector and drawing-sheet references, including LSB sensor addressing and CAN faults. Electrical identifiers match the accompanying schematic bundle. Error-list identification number 892010350; drawing 9250-700.01.00.000.047. Metadata notes: 040601 is a machine/document-set identifier; the cover does not explicitly label it as serial number. 892010350 is the labelled error-list identification number, not a unique identifier for this entire machine-specific export. No separate revision is labelled; drawing suffix .047 is preserved as part of the drawing number, not asserted as document revision. LICCON 2 schema grouping is supported by matching 98054246 in the companion electrical title sheet.",
    "sections": [
      {
        "ref": "PDF p. 2",
        "title": "LICCON ERROR CODE (LEC)",
        "summary": "Reference table identifies electrical and error-list drawings."
      },
      {
        "ref": "PDF p. 3",
        "title": "Fehler-Nr. Fehlertext / Reaktion / Behebung",
        "summary": "Fault-code, reaction and remedy table continues through PDF page 859."
      }
    ],
    "manufacturer": "Liebherr",
    "sourceSystem": "LICCON / LSB; electrical sets 98054246 and 98080251",
    "documentType": "Error codes",
    "preparedFilename": "Liebherr_LTM-1060-3.1_Error-Codes_040601_2026.pdf",
    "subtitle": "Error codes | LTM 1060-3.1 | 040601",
    "pages": 859,
    "appliesTo": [],
    "craneTypes": [
      "LTM"
    ],
    "fileName": "Liebherr_LTM-1060-3.1_Error-Codes_040601_2026.pdf",
    "cleanFile": "Liebherr_LTM-1060-3.1_Error-Codes_040601_2026.pdf",
    "year": 2026,
    "docNumber": "892010350"
  },
  {
    "id": "import-liebherr-ltm-1060-3-1-service-fill-edbcc7a0eeb49b47",
    "system": "Liebherr",
    "type": "Reference",
    "title": "LTM 1060-3.1 Service Fill",
    "summary": "Illustrated service-fill reference for LTM 1060-3.1, identifier 040601. Gives source quantities, units and material item numbers for hydraulic oil, cooling system, transmission, axles, diesel, urea solution, engine oil and grease locations. Six drawing/list pairs; this is a maintenance reference, not a workshop repair manual. Metadata notes: No whole-document number or revision printed; SBF-040601_000_en is a source filename identifier only. Quantities are source values for this equipment configuration; broader model applicability is not established.",
    "sections": [
      {
        "ref": "PDF p. 1",
        "title": "SERVICE FILL",
        "summary": "Repeated source title across six drawing/list pairs: 96034362 (pp. 1-2), 968693808 (3-4), 96033744 (5-6), 96072404 (7-8), 96066237 (9-10), 96025099 (11-12)."
      }
    ],
    "manufacturer": "Liebherr",
    "sourceSystem": "Lubricants / fluids / service-fill quantities",
    "documentType": "Service-fill reference",
    "preparedFilename": "Liebherr_LTM-1060-3.1_Service-Fill_040601_2026.pdf",
    "subtitle": "Service-fill reference | LTM 1060-3.1 | 040601",
    "pages": 12,
    "appliesTo": [],
    "craneTypes": [
      "LTM"
    ],
    "fileName": "Liebherr_LTM-1060-3.1_Service-Fill_040601_2026.pdf",
    "cleanFile": "Liebherr_LTM-1060-3.1_Service-Fill_040601_2026.pdf",
    "year": 2026
  },
  {
    "id": "import-liebherr-ltm-1060-3-1-parts-e01cd6e5b79eab96",
    "system": "Liebherr",
    "type": "Reference",
    "title": "LTM 1060-3.1 Spare Parts Catalogue",
    "summary": "English/German illustrated parts catalogue for LTM 1060-3.1, identifier 040601. Exploded assemblies and item references support component identification, hydraulic pump and valve work, suspension, slewing gear, boom and electrical parts selection. Includes numerical and bilingual alphabetical indexes. Parts illustrations do not establish repair procedures or adjustment specifications. Metadata notes: No separately labelled global document number or revision identified. Printed J and numerical footer codes are not interpreted as a revision without a legend. Applicability is limited to the supplied 040601 configuration; do not assume every LTM 1060-3.1 uses every listed part.",
    "sections": [
      {
        "ref": "PDF p. 18",
        "title": "919491808 / COOLER INSTALLATION",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 32",
        "title": "918769808 / PUMP ASSEMBLY CRANE HYDR.",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 45",
        "title": "91006268 / DIESEL ENGINE INSTALLATION",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 218",
        "title": "91007152 / AXLE 1 WITH SUSPENSION",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 240",
        "title": "91007153 / AXLE 2+3 WITH SUSPENSION",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 617",
        "title": "91001984 / HYDRAULIC AXLE SUSPENSION",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 721",
        "title": "91002590 / SLEWING GEAR",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 998",
        "title": "91000941 / TELESCOPIC BOOM CPL.",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 1163",
        "title": "Numerical index",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 1245",
        "title": "Alphabetical index (EN)",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 1407",
        "title": "Alphabetical index (DE)",
        "summary": "Source heading; consult the cited PDF page and following section."
      }
    ],
    "manufacturer": "Liebherr",
    "sourceSystem": "Mechanical / hydraulic / electrical assemblies",
    "documentType": "Spare parts catalogue",
    "preparedFilename": "Liebherr_LTM-1060-3.1_Spare-Parts-Catalogue_040601_2026.pdf",
    "subtitle": "Spare parts catalogue | LTM 1060-3.1 | 040601",
    "pages": 1568,
    "appliesTo": [],
    "craneTypes": [
      "LTM"
    ],
    "fileName": "Liebherr_LTM-1060-3.1_Spare-Parts-Catalogue_040601_2026.pdf",
    "cleanFile": "Liebherr_LTM-1060-3.1_Spare-Parts-Catalogue_040601_2026.pdf",
    "year": 2026
  },
  {
    "id": "import-liebherr-ltm-1060-3-1-schematics-586e389c9cf36c45",
    "system": "LICCON 2",
    "type": "Reference",
    "title": "LTM 1060-3.1 Electrical, Hydraulic and Pneumatic Schematics",
    "summary": "Combined LTM 1060-3.1 schematic set: LICCON 2 superstructure and carrier electrical circuits, LSB/CAN layouts, fuse grouping, hydraulic circuits and carrier compressed-air systems. Includes EN13000 assistance-system/TRAXON2 carrier electrics. Carrier hydraulic set 98038658 also names LTM 1055-3.1, LTM 1055/1 and LTM 1055-3.2; that broader applicability is limited to this component set. Metadata notes: No single global revision or printed issue year; omitted from proposed record. Component drawing revisions vary: 3388-932.06.00.001- 002; 3288-920.17.01.000- 000; 3388-970.16.00.001- 000; 3288-950.16.00.001- 004. Additional LTM 1055 models are applicable only to carrier hydraulic drawing 98038658, not the whole bundle.",
    "sections": [
      {
        "ref": "PDF p. 3",
        "title": "CIRCUIT DIAGRAM ELECTRICS SUPERSTRUCTURE",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 8",
        "title": "GENERAL LAYOUT LSB SUPERSTRUCTURE,",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 10",
        "title": "GENERAL LAYOUT CAN,",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 171",
        "title": "CIRCUIT DIAGRAM ELECTRICS CARRIER",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 369",
        "title": "FUSE GROUPING SUPERSTRUCTURE",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 375",
        "title": "FUSE GROUPING CARRIER",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 383",
        "title": "CIRCUIT DIAGRAM HYDRAULICS SUPERSTRUCTURE",
        "summary": "Source heading; consult the cited PDF page and following section."
      },
      {
        "ref": "PDF p. 401",
        "title": "CIRCUIT DIAGRAM HYDRAULICS / COMPRESSED-AIR SYSTEM CARRIER",
        "summary": "Source heading; consult the cited PDF page and following section."
      }
    ],
    "manufacturer": "Liebherr",
    "sourceSystem": "LICCON 2 / LSB / CAN / EN13000 / assistance system / TRAXON2 / hydraulics / compressed air",
    "documentType": "Electrical and hydraulic schematics",
    "preparedFilename": "Liebherr_LTM-1060-3.1_Electrical-Hydraulic-Schematics_040601.pdf",
    "subtitle": "Electrical and hydraulic schematics | LTM 1060-3.1 | 040601",
    "pages": 420,
    "appliesTo": [],
    "craneTypes": [
      "LTM"
    ],
    "fileName": "Liebherr_LTM-1060-3.1_Electrical-Hydraulic-Schematics_040601.pdf",
    "cleanFile": "Liebherr_LTM-1060-3.1_Electrical-Hydraulic-Schematics_040601.pdf",
    "docNumber": "98054246; 98080251; 98060793; 98038658"
  }
] satisfies TechDoc[];
