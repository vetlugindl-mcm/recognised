# Project Manifesto & Engineering Standards (v2025.12.5)

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
│   ├── promptService.ts # Extraction Logic (Not Formatting)
│   └── storageService.ts# [NEW] Persistence (Hybrid Strategy)
├── utils/               # Pure Functions & Helpers
│   ├── errors.ts        # Standardized Error Handling
│   ├── validationSchemas.ts # Zod Definitions (Runtime Safety)
│   └── responseParser.ts# LLM Sanitization & Validation
├── types.ts             # Centralized Type Definitions (DTOs)
├── App.tsx              # Router & Global State Holder
└── index.html           # Entry Point & Importmaps
```

### Key Architectural Patterns
1.  **Schema-Driven UI:** Forms and result cards (`UnifiedProfileForm`, `AnalysisResult`) are generated dynamically from `configs/documentSchemas.ts`. We **DO NOT** hardcode input fields for specific documents in JSX.
2.  **Runtime Validation:** We trust no one, especially AI. All LLM responses must pass through `Zod` schemas (`utils/validationSchemas.ts`) before reaching the UI state, even if the API guarantees strict JSON.
3.  **Service Isolation:**
    *   UI components never touch `pdfjsLib` directly (use `PdfService`).
    *   UI components never touch `localStorage` or `indexedDB` directly (use `StorageService`).
4.  **Strategy Pattern:** Logic switches between Live API and `MockService` based on environment variables.

---

## 3. Coding Standards (Strict Mode)

### 3.1 Typing & Safety (Critical)
*   **NO `any`:** The use of `any` is strictly prohibited. Use `unknown` with type guards or generics.
*   **Zod Integration:** API responses are parsed via `cleanAndParseJson`.
*   **Error Normalization:** All catch blocks must use `normalizeError` or throw `AppError` to ensure consistent error shapes in the UI.

```typescript
// ✅ CORRECT
try { 
  ... 
} catch (error) { 
  throw new AppError('NETWORK_ERROR', 'Failed to fetch', error); 
}
```

### 3.2 Naming Conventions
*   **Schemas:** `[Entity]Schema` (e.g., `PassportSchema`).
*   **Components:** `PascalCase` (e.g., `UnifiedProfileForm.tsx`).
*   **Services:** `camelCase` (e.g., `pdfService.ts`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `DOCUMENT_SCHEMAS`).

### 3.3 Security & Performance
*   **Memory Management:** explicit cleanup of `URL.createObjectURL` via `useEffect` return function is MANDATORY.
*   **Sanitization:** AI JSON output is parsed via `cleanAndParseJson`.
*   **PDF Processing:** Heavy PDF operations must be offloaded to `PdfService` to keep components clean.

---

## 4. UI/UX Guidelines

### 4.1 Visual Language ("Premium Utility")
*   **Palette:** Monochrome. Color is used *only* for status (Green = Verified, Red = Error) or primary actions.
*   **Structure:** Layouts are defined by the Data Schema. If a field exists in `documentSchemas.ts`, it automatically appears in the UI.

### 4.2 Kinetic Motion & Animation
*   **Physics-Based Easing:** All interactive transitions **MUST** use `cubic-bezier(0.23, 1, 0.32, 1)`.
*   **Staggered Entry:** Lists and grids must use `animate-enter` with increasing `animation-delay`.

---

## 5. AI Integration Rules (Structured Output)

1.  **Native Structured Output:** We **DO NOT** use prompt engineering to force JSON (e.g., "Return valid JSON"). instead, we use the `responseSchema` configuration in `configs/aiSchema.ts`.
2.  **Extraction Logic Only:** Prompts in `services/promptService.ts` should focus solely on *how* to extract data (e.g., "Look for SNILS at the bottom"), not on formatting the response.
3.  **Validation First:** The application must never crash because AI returned a missing field. Zod schemas must handle `null` coercion (e.g., `transform(val => val ?? "")`) to ensure UI safety.
4.  **Mocking:** `MockService` must strictly adhere to the same interfaces (`AnalyzedDocument`) as the real AI.

---

## 6. Persistence Strategy (Hybrid)

1.  **Metadata (Fast):** Analysis results (JSON) and file metadata are stored in `localStorage` for synchronous, instant hydration on load.
2.  **Blobs (Heavy):** Binary files (images, PDFs) are stored in `IndexedDB` (via `idb-keyval`) to avoid the 5MB localStorage limit.
3.  **Hydration:** The app loads metadata first to paint the UI skeleton, then lazily loads blobs from IndexedDB.

---

## 7. Deprecations (Do Not Use)

*   ❌ **JSON Formatting Prompts:** Do not ask the model to "Format as JSON". Use `responseSchema`.
*   ❌ **Hardcoded Forms:** Do not manually write `<input>` for document fields. Update `configs/documentSchemas.ts` instead.
*   ❌ **Direct `JSON.parse`:** Always use `cleanAndParseJson` from `utils/responseParser.ts`.
*   ❌ **Monolithic `gemini.ts`:** Do not put prompt text or mock data inside the main service file.
*   ❌ **Raw `Error` throwing:** Always wrap errors in `AppError`.
