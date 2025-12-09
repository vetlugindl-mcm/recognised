# Project Manifesto & Engineering Standards (v2025.12)

> **Context:** December 2025.
> **Philosophy:** "Premium Utility". The application serves as a high-precision tool for document processing. It combines monochromatic aesthetics with robust, strictly typed logic.

---

## 1. Tech Stack & Dependencies

The project relies on a modern, lean stack without unnecessary build steps for maximum portability.

| Category | Technology | Version / Standard |
| :--- | :--- | :--- |
| **Core** | React | **v19.2.0+** (via Importmap) |
| **Language** | TypeScript | **v5.7+** (Strict Mode) |
| **Styling** | Tailwind CSS | **v3.4+** (Utility-first) |
| **AI Engine** | Google GenAI SDK | `@google/genai` v1.30+ |
| **PDF Engine** | PDF.js | v3.11.174 (Client-side rendering) |
| **Build Tool** | Vite | (Implicit via structure) |

---

## 2. Architecture & Directory Structure

We utilize a **Feature-Based Modular Architecture** flattened for maintainability.

```text
/
├── components/          # UI Components
│   ├── common/          # Reusable Atoms (FormFields, etc.)
│   ├── icons/           # SVG Icon Registry
│   ├── AnalysisResult   # Document visualization logic
│   ├── DocumentScanner  # Main business logic container
│   └── ...
├── services/            # API Integration Layer
│   └── gemini.ts        # AI interactions & Mock logic
├── utils/               # Pure Functions
│   └── responseParser.ts# LLM Output Sanitization
├── types.ts             # Centralized Type Definitions (DTOs)
├── App.tsx              # Router & Global State Holder
└── index.html           # Entry Point & Importmaps
```

### Key Architectural Patterns
1.  **State-Based Routing:** We do not use `react-router-dom`. Navigation is managed via `ViewState` in `App.tsx`.
2.  **Service Isolation:** UI components NEVER call `fetch` directly. All API interactions pass through `services/gemini.ts`.
3.  **Data Normalization:** Raw AI responses are sanitized in `utils/` before reaching the UI. The UI only renders strict `AnalyzedDocument` types.

---

## 3. Coding Standards (Strict Mode)

### 3.1 Typing & Safety (Critical)
*   **NO `any`:** The use of `any` is strictly prohibited. Use `unknown` with type guards or generics.
*   **Generics:** Use generics for reusable logic (e.g., `handleFieldUpdate<T>`).
*   **External Libs:** If a library (like PDF.js) lacks types, define a minimal strict interface in the consuming file (see `DocumentScanner.tsx`).

```typescript
// ✅ CORRECT
try { ... } catch (error: unknown) { if (error instanceof Error) ... }

// ❌ FORBIDDEN
try { ... } catch (error: any) { ... }
```

### 3.2 Naming Conventions
*   **Components:** `PascalCase` (e.g., `UnifiedProfileForm.tsx`).
*   **Functions/Vars:** `camelCase` (e.g., `handleFilesAdded`).
*   **Types/Interfaces:** `PascalCase` (e.g., `UserProfile`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `SYSTEM_PROMPT`).

### 3.3 Security & Performance
*   **Memory Management:** explicit cleanup of `URL.createObjectURL` via `useEffect` return function is MANDATORY for all file previews.
*   **Sanitization:** AI JSON output is parsed via `cleanAndParseJson` to strip Markdown blocks (` ```json `).
*   **Secrets:** API Keys are accessed via `process.env`. Fallback to Mock Data if key is missing (for safe dev/demo).

---

## 4. UI/UX Guidelines

### 4.1 Visual Language ("Premium Utility")
*   **Palette:** Monochrome. Color is used *only* for status (Green = Verified, Red = Error).
*   **Texture:** Subtle noise (`.bg-noise`) and glassmorphism (`.glass-panel`) are core brand elements.
*   **Animation:** Staggered entry animations (`animate-enter`) for lists and cards.

### 4.2 Component Patterns
*   **Forms:** Use inline editing patterns (`FormFields.tsx`). Do not use modal forms for data correction.
*   **Skeletons:** Always use `AnalysisSkeleton` during AI processing. Never show a blank screen.
*   **Feedback:** UI must be optimistic. File upload appears immediately; processing status updates asynchronously.

---

## 5. AI Integration Rules

1.  **System Prompts:** Prompts are defined in `services/gemini.ts`. They must strictly enforce JSON output.
2.  **Mocking:** The service layer must include a robust Mock generator based on filenames to allow development without burning API credits.
3.  **Error Handling:** AI errors must be caught, mapped to user-friendly strings (e.g., "Safety Filter Triggered"), and displayed on the specific card, not globally crashing the app.

---

## 6. Deprecations (Do Not Use)

*   ❌ **`React.useEffect` for data fetching:** Use event handlers (button clicks, file drops) to trigger async actions.
*   ❌ **`alert()`:** Use specific error states in the UI.
*   ❌ **Uncontrolled Inputs:** All form fields must be controlled components via `value` and `onChange`.
