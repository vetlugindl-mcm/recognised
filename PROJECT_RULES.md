
# Project Manifesto & Design System

> **Philosophy:** "Premium Utility". The interface should feel like a precision tool: monochromatic, tactile, fast, and distraction-free.

## 1. Tech Stack & Architecture

*   **Core:** React 19, TypeScript 5+, Vite (implied).
*   **Styling:** Tailwind CSS (Utility-first) + CSS Modules (for complex animations).
*   **AI Engine:** Google Gemini API (`@google/genai`) - Model: `gemini-2.5-flash`.
*   **PDF Processing:** `pdf.js` (Client-side rendering for thumbnails).
*   **State Management:** React Hooks (`useState`, `useCallback`). 
*   **Icons:** Heroicons (SVG) via centralized `components/icons`.

### Directory Structure
```
src/
├── components/        # Shared UI components
│   ├── icons/         # Centralized Icon Library (Single source of truth)
│   ├── ui/            # Visual primitives
│   └── ...            # Feature components (DocumentScanner, etc.)
├── services/          # API integrations (Gemini)
├── types.ts           # Shared TypeScript interfaces
├── styles.css         # Global styles & Design Tokens
└── ...
```

---

## 2. Design System (Material Design 3 Inspired)

### Color Palette (Monochrome)
We avoid colorful UI elements. Color is reserved for **Status** and **Actions**.

| Token | CSS Variable | Tailwind | Hex | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Surface** | `--bg-surface` | `bg-white` | `#FFFFFF` | Main cards, panels |
| **Background** | `--bg-app` | `bg-gray-50` | `#FAFAFA` | App background |
| **Text Primary** | `--text-primary` | `text-gray-900` | `#111827` | Headings, Input values |
| **Text Secondary**| `--text-secondary`| `text-gray-500` | `#6B7280` | Labels, Menu items |
| **Success** | N/A | `text-green-500`| `#22C55E` | Verified status, Done |
| **Accent** | `--accent` | `bg-black` | `#000000` | Primary Actions |

### Typography (Material Type Scale)
Strict adherence to the scale to ensure readability and data density.

| Role | Size | Tailwind | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Headline Small** | 24px | `text-2xl` | Bold | Page Titles |
| **Title Large** | 20px | `text-xl` | Bold | Card Headers |
| **Body Large** | 16px | `text-base` | Regular | **Editable Data Values** |
| **Body Medium** | 14px | `text-sm` | Medium | Menu Items, File Names |
| **Label Medium** | 12px | `text-xs` | Medium | **Field Labels**, File Meta |
| **Label Small** | 11px | `text-[11px]`| Bold | Overlines, Badges |

### Spacing & Radius
*   **Grid:** 4px base unit.
*   **Padding:** Cards (`p-6` or `p-8`), Items (`p-3`).
*   **Radius:** Cards (`rounded-2xl`), Buttons (`rounded-xl`).

---

## 3. UI Patterns & Behavior

### File List (Optimistic UI)
*   **Upload:** Files appear immediately in the list.
*   **Thumbnails:** 
    *   Images: Generated via `URL.createObjectURL`.
    *   PDFs: Generated asynchronously via `pdf.js` (Canvas -> DataURL).
*   **Status Lifecycle:** Clock (Idle) -> Spinner (Analyzing) -> Green Check (Verified).

### Data Interaction (Inline Editing)
*   **Mode:** "Click-to-Edit". All parsed fields must be editable.
*   **Visuals:** Pencil icon appears on hover next to the field label.
*   **Behavior:** Clicking pencil converts text to an input field. 
*   **Save:** Occurs on `Blur` or `Enter` key.

### Loading States
*   **Global Analysis:** Use **Skeletons** (`AnalysisSkeleton`) to mock the layout structure.
*   **Item Status:** Use **Spinners** (`LoaderIcon`) for individual file status in lists.

---

## 4. Coding Standards

*   **Icons:** NEVER import SVGs directly in components. Always import from `components/icons`.
*   **Naming:**
    *   Components: `PascalCase.tsx`
    *   Handlers: `handleEventName` (e.g., `handleFilesAdded`).
    *   Props: `onEventName` (e.g., `onUpdate`).
*   **Types:** No `any`. Define interfaces in `types.ts` for all data structures (PassportData, DiplomaData).
*   **Error Handling:** Provide user-friendly error messages in Russian for API failures (400, 401, 429, 500).

## 5. Git & Commits
*   Feat: `feat: integrate pdf.js thumbnail generation`
*   Fix: `fix: responsive file list height`
*   Refactor: `refactor: centralize icons`
*   Style: `style: update typography to material scale`
