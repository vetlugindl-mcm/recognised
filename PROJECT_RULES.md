
# Project Manifesto & Engineering Standards (v2025.12.7)

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
│   └── documentSchemas.ts # UI & Data definitions for documents
├── components/          # UI Components
│   ├── common/          # Reusable Atoms (FormFields, etc.)
│   ├── icons/           # SVG Icon Registry (Modular files)
│   ├── AnalysisResult   # Schema-driven visualization
│   └── ...
├── services/            # API & Logic Isolation Layer
│   ├── gemini.ts        # Main AI Orchestrator
│   ├── mockService.ts   # Mock Strategy
│   ├── pdfService.ts    # PDF Logic Isolation
│   ├── promptService.ts # Extraction Logic (OCR & Normalization)
│   └── storageService.ts# Persistence (Hybrid Strategy)
├── utils/               # Pure Functions & Helpers
│   ├── businessRules.ts # [NEW] Compliance & Validation Logic
│   ├── errors.ts        # Standardized Error Handling
│   ├── validationSchemas.ts # Zod Definitions (Runtime Safety)
│   └── responseParser.ts# LLM Sanitization & Validation
├── types.ts             # Centralized Type Definitions (DTOs)
├── App.tsx              # Router & Global State Holder
└── index.html           # Entry Point & Importmaps
```

---

## 3. Coding Standards (Strict Mode)

### 3.1 Typing & Safety (Critical)
*   **NO `any`:** The use of `any` is strictly prohibited. Use `unknown` with type guards or generics.
*   **Zod Integration:** API responses are parsed via `cleanAndParseJson`.
*   **Error Normalization:** All catch blocks must use `normalizeError` or throw `AppError` to ensure consistent error shapes in the UI.

### 3.2 Naming Conventions
*   **Schemas:** `[Entity]Schema` (e.g., `SnilsDocSchema`, `PassportSchema`).
*   **Components:** `PascalCase` (e.g., `UnifiedProfileForm.tsx`).
*   **Services:** `camelCase` (e.g., `pdfService.ts`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `DOCUMENT_SCHEMAS`).

---

## 4. OCR & Data Extraction Rules (AI Strategy)

We employ specific strategies to handle the complexities of Russian bureaucratic documents.

### 4.1 Date Normalization
*   **Problem:** Documents mix digital dates ("13.11.2025") and text dates ("13 ноября 2025 года").
*   **Rule:** The AI **MUST** normalize all dates to the `DD.MM.YYYY` format during the extraction phase.
*   **Implementation:** Enforced via System Prompt instructions.

### 4.2 Spatial Awareness (Headers vs. Body)
*   **Problem:** Critical IDs (like Qualification Registration Numbers) often appear in the top page header, above the document title.
*   **Rule:** The OCR extraction instruction must explicitly direct the model to scan the **entire viewport**, including headers and footers, before processing the main body.
*   **Target:** Specifically for `qualification` (NOK) documents, the `registrationNumber` is prioritized from the top-right or top-center header.

### 4.3 Complex Address Parsing
*   **Problem:** Registration stamps in passports are unstructured text blocks.
*   **Rule:** Addresses must be split into atomic components: `City`, `Street`, `House`, `Flat`.
*   **Logic:** The prompt instructs the model to read multi-line stamps aggressively to find "hidden" house/flat numbers on the second or third lines.

### 4.4 Document Classification
The system currently supports and strictly distinguishes:
1.  **Passport (`passport`)**: Main identity document. Contains Identity + Registration.
2.  **SNILS (`snils`)**: Green laminated card. Extracted as a standalone document but merged into the Identity profile.
3.  **Diploma (`diploma`)**: Education document.
4.  **Qualification (`qualification`)**: NOK Certificate (Independent Qualification Assessment).

---

## 5. UI/UX Guidelines

### 5.1 Visual Language ("Premium Utility")
*   **Palette:** STRICT MONOCHROME.
    *   **Primary:** Black (`#000000`) or Gray-900 (`#111827`).
    *   **Surface:** White (`#ffffff`) or Gray-50 (`#fafafa`).
    *   **Accents:** Avoid blue/purple. Use Grayscale or semantic colors (Green/Red) *only* for status.
*   **Structure:** Layouts are defined by the Data Schema. If a field exists in `documentSchemas.ts`, it automatically appears in the UI.
*   **Iconography:** Use specific industry metaphors for navigation:
    *   **NOSTROY**: `ApartmentBuildingIcon` (High-rise construction focus).
    *   **NOPRIZ**: `CitySkylineIcon` (Urban planning focus).

### 5.2 Kinetic Motion & Animation
*   **Physics-Based Easing:** All interactive transitions **MUST** use `cubic-bezier(0.23, 1, 0.32, 1)`.
*   **Staggered Entry:** Lists and grids must use `animate-enter` with increasing `animation-delay`.

### 5.3 Layout Constants (Responsive)
These values are hardcoded to ensure alignment between the fixed Header, Sidebar, and Brand Assets.

| Component | Height/Position | Class | Notes |
| :--- | :--- | :--- | :--- |
| **Header** | 80px | `h-20` | Fixed height. |
| **Logo** | 44px | `h-11` | Scaled to match `h-20` header (~30% reduction from 2x). |
| **Sidebar** | Top 80px | `top-20` | Must align exactly with the bottom of the Header. |

---

## 6. Persistence Strategy (Hybrid)

1.  **Metadata (Fast):** Analysis results (JSON) and file metadata are stored in `localStorage`.
2.  **Blobs (Heavy):** Binary files (images, PDFs) are stored in `IndexedDB` (via `idb-keyval`).
3.  **Hydration:** The app loads metadata first to paint the UI skeleton, then lazily loads blobs from IndexedDB.

---

## 7. Deprecations (Do Not Use)

*   ❌ **JSON Formatting Prompts:** Do not ask the model to "Format as JSON". Use `responseSchema`.
*   ❌ **Hardcoded Forms:** Do not manually write `<input>` for document fields. Update `configs/documentSchemas.ts` instead.
*   ❌ **Direct `JSON.parse`:** Always use `cleanAndParseJson` from `utils/responseParser.ts`.
*   ❌ **Raw `Error` throwing:** Always wrap errors in `AppError`.
*   ❌ **Arbitrary Colors:** Do not use `blue-500`, `indigo-600`, etc. Stick to `gray-*` or `black`.
