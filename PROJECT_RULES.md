
# Project Manifesto & Engineering Standards (v2025.12.8)

> **Context:** December 2025.
> **Philosophy:** "Premium Utility". The application serves as a high-precision tool for document processing. It combines monochromatic aesthetics with robust, strictly typed logic, schema-driven UI, and kinetic interactions.

---

## 1. Tech Stack & Dependencies

The project relies on a modern, lean stack without unnecessary build steps for maximum portability.

| Category | Technology | Version / Standard |
| :--- | :--- | :--- |
| **Core** | React | **v19.2.0+** (via Importmap) |
| **Language** | TypeScript | **v5.7+** (Strict Mode) |
| **Validation** | Zod | **v3.22+** (Runtime Type Checking) |
| **Styling** | Tailwind CSS | **v3.4+** (Utility-first) |
| **AI Engine** | Google GenAI SDK | `@google/genai` v1.30+ |
| **Persistence**| idb-keyval | **v6+** (IndexedDB Wrapper) |
| **PDF Engine** | PDF.js | v3.11.174 (Client-side rendering) |
| **Build Tool** | Vite | (Implicit via structure) |

---

## 2. Architecture & Directory Structure

We utilize a **Feature-Based Modular Architecture** flattened for maintainability, with a heavy emphasis on **Data-Driven Design**.

```text
/
├── configs/             # [NEW] Single Source of Truth
│   ├── aiSchema.ts      # Native GenAI Output Schema (Strict JSON)
│   ├── documentSchemas.ts # UI & Data definitions for documents
│   └── templateVariables.ts # Docx Template mappings
├── components/          # UI Components
│   ├── common/          # Reusable Atoms (FormFields, etc.)
│   ├── icons/           # SVG Icon Registry (Modular files)
│   └── ...
├── services/            # API & Logic Isolation Layer
│   ├── gemini.ts        # Main AI Orchestrator
│   ├── docGenerator.ts  # Word Generation
│   └── storageService.ts# Persistence (Hybrid Strategy)
├── utils/               # Pure Functions & Helpers
│   ├── businessRules.ts # Compliance & Validation Logic
│   └── errors.ts        # Standardized Error Handling
├── types.ts             # Centralized Type Definitions (DTOs)
└── App.tsx              # Router & Global State Holder
```

---

## 3. Coding Standards (Strict Mode)

### 3.1 Typing & Safety (Critical)
*   **NO `any`:** The use of `any` is strictly prohibited. Use `unknown` with type guards or generics.
*   **Zod Integration:** API responses are parsed via `cleanAndParseJson`.
*   **Error Normalization:** All catch blocks must use `normalizeError` or throw `AppError`.

### 3.2 Naming Conventions
*   **Schemas:** `[Entity]Schema` (e.g., `SnilsDocSchema`, `PassportSchema`).
*   **Components:** `PascalCase` (e.g., `UnifiedProfileForm.tsx`).
*   **Services:** `camelCase` (e.g., `pdfService.ts`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `DOCUMENT_SCHEMAS`).

---

## 4. AI & Data Extraction Rules

### 4.1 Date Normalization
*   **Rule:** The AI **MUST** normalize all dates to the `DD.MM.YYYY` format.

### 4.2 Spatial Awareness
*   **Rule:** The OCR instructions must explicitly direct the model to scan the **entire viewport**, prioritizing headers for critical IDs (like NOK Reg Numbers).

### 4.3 Handwriting Detection
*   **Rule:** The model must identify if key fields (Address, Name) are handwritten. This flags the `isHandwritten` boolean, which triggers UI warnings.

---

## 5. UI/UX Guidelines ("Premium Utility")

### 5.1 Visual Language: Strict Monochrome
*   **Palette:**
    *   **Active/Focus:** `#000000` (Black). Do not use blue/indigo for focus states.
    *   **Surface:** White, Gray-50, or Transparent Blur.
    *   **Semantic Colors:** 
        *   **Red (`text-red-500`):** Strictly for errors and **empty/unrecognized fields**.
        *   **Green (`text-green-500`):** Strictly for verified success.
*   **Patterns:** Use `bg-grid` (engineering graph paper style) for empty states, dropzones, and backgrounds to imply technical precision.

### 5.2 Kinetic Motion (Physics-Based)
*   **Easing:** All interactive transitions (hover, drag, modal open) **MUST** use the custom bezier:
    *   `cubic-bezier(0.23, 1, 0.32, 1)`
    *   This provides a "heavy", premium feel with a quick snap and slow settle.
*   **Micro-interactions:** Elements should lift (`-translate-y-1`), scale slightly (`scale-102`), or cast a shadow on hover.

### 5.3 Validation UI
*   **Empty Fields:** If a required field is empty/null:
    *   Text must display "Не распознано" in **Red**.
    *   Background may have a subtle red tint.
    *   This ensures the user *cannot* miss a parsing error before generating documents.

---

## 6. Persistence Strategy (Hybrid)

1.  **Metadata (Fast):** Analysis results (JSON) and file metadata are stored in `localStorage`.
2.  **Blobs (Heavy):** Binary files (images, PDFs) are stored in `IndexedDB`.
3.  **Hydration:** UI loads instantly from LocalStorage; images hydrate asynchronously.

---

## 7. Deprecations (Do Not Use)

*   ❌ **Blue Accents:** Do not use `blue-500` for primary actions. Use Black.
*   ❌ **Complex Scanners:** No "laser beam" animations. Use clean, kinetic states.
*   ❌ **Direct `JSON.parse`:** Always use `cleanAndParseJson`.
