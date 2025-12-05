
# Project Manifesto & Design System

> **Philosophy:** "Premium Utility". The interface should feel like a precision tool: monochromatic, tactile, fast, and distraction-free.

## 1. Tech Stack & Architecture

*   **Core:** React 19, TypeScript 5+, Vite.
*   **Styling:** Tailwind CSS (Utility-first) + CSS Modules (for specific animations).
*   **AI Engine:** Google Gemini API (`@google/genai`) - Model: `gemini-2.5-flash`.
*   **PDF Processing:** `pdf.js` (v3.11.174 via CDN). Client-side canvas rendering for thumbnails.
*   **Routing:** Custom State-based Routing (Managed via `App.tsx` state).
*   **Icons:** Heroicons (SVG) via centralized `components/icons`.

### Architecture Patterns

1.  **State-Based Navigation:**
    *   We do not use `react-router-dom`.
    *   **Routes:**
        *   `scanner`: Default NOPRIZ document intake.
        *   `nostroy`: NOSTROY document intake (Reuses Scanner component).
        *   `templates`: Template management registry.
    *   Navigation is controlled by a root state `currentView` in `App.tsx`.

2.  **Layout Composition:**
    *   `DashboardLayout` is the single source of truth for the application shell.
    *   It manages the **Sidebar** (Desktop/Mobile Drawer) and **Header**.
    *   It provides the global background texture (noise + radial gradients).

3.  **Data Flow:**
    *   **Optimistic UI:** Files appear instantly upon upload. Statuses update asynchronously.
    *   **Inline Editing:** Data displayed in `AnalysisResult` is editable. Changes update the local state immediately.
    *   **Variable Mapping:** Template variables are strictly mapped to Database fields via `VARIABLES_DATA`.

---

## 2. Design System (Material Design 3 Inspired)

### Color Palette (Monochrome)
Color is used sparingly for semantic meaning only.

| Token | Tailwind | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Surface** | `bg-white` | `#FFFFFF` | Cards, Panels, Header |
| **Background** | `bg-[#fafafa]` | `#FAFAFA` | Global App Background |
| **Text Primary** | `text-gray-900` | `#111827` | Headings, Data Values |
| **Text Secondary**| `text-gray-500` | `#6B7280` | Labels, Menu Items |
| **Accent** | `bg-black` | `#000000` | Primary Actions, Active States |
| **Success** | `text-green-500`| `#22C55E` | Verified Status |
| **Error** | `text-red-500` | `#EF4444` | Error States |

### Typography (Scale)
Strict adherence to ensure visual hierarchy.

| Role | Size | Weight | Tailwind Class | Context |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 30px | Black | `text-3xl font-black` | Brand Logo |
| **Page Title** | 24px | Bold | `text-2xl font-bold` | View Headers |
| **Card Title** | 20px | Bold | `text-xl font-bold` | Document Types |
| **Body Data** | 16px | Regular | `text-base` | **Editable Fields** |
| **Body UI** | 14px | Medium | `text-sm` | Menu, Buttons, Files |
| **Label** | 12px | Medium | `text-xs` | Field Labels, Metadata |
| **Overline** | 10px | Bold | `text-[10px] uppercase` | Section Headers |

### Visual Effects
*   **Noise Texture:** Applied globally via `.bg-noise` to add "paper-like" tactility.
*   **Glassmorphism:** Used in `Header`, `Modals` and floating panels (`backdrop-blur-xl bg-white/80`).
*   **Shadows:** Soft, diffuse shadows (`shadow-xl shadow-gray-200/50`) to create depth without harsh lines.

---

## 3. Component Guidelines

### Sidebar & Navigation
*   **Desktop:** Fixed column.
*   **Mobile:** Off-canvas Drawer with backdrop (`fixed inset-0 z-40`). Triggered by `Bars3Icon`.
*   **States:** Active items are highlighted with `bg-black text-white`.

### Dropzone (Universal)
*   **Props:** Must accept `title`, `subtitle`, `accept` (MIME types), and `onFilesAdded`.
*   **Behavior:** Supports both drag-and-drop and click-to-select.
*   **Visuals:** Dashed border. Expands/Contracts based on state.

### File List
*   **Previews:**
    *   **Images:** Native `URL.createObjectURL`.
    *   **PDFs:** Rendered to Canvas via `pdf.js` (Page 1), exported as Base64 image.
*   **Status Lifecycle:**
    1.  `ClockIcon` (Queued)
    2.  `LoaderIcon` (Analyzing - Animated Spinner)
    3.  `CheckIcon` (Complete - Green)

### Analysis Result (Cards)
*   **Layout:** Header -> Body (Grid) -> Footer (Status).
*   **Dark Header Pattern:** Used for "Official" ID documents (**Passport**, **Qualification Certificate**). Adds a black background and subtle glow.
*   **Light Header Pattern:** Used for standard documents (**Diploma**).
*   **Interaction:** Hovering over a field reveals Pencil (Edit) and Clipboard (Copy) icons.
*   **Edit Mode:** Swaps `<span>` for `<input type="text">` inline.

### Modals
*   **Structure:** Fixed overlay (`bg-black/20 backdrop-blur-sm`) + Centered Glass Panel.
*   **Animation:** `animate-enter` for smooth appearance.
*   **Content:** Must include a clear Header with Title and Close button.

---

## 4. Feature Specifications

### Document Scanner (OCR)
*   **Supported Types:**
    1.  **Passport:** Extract Personal Data, Issue Data, Registration.
    2.  **Diploma:** Extract Education info, Series/Number.
    3.  **Qualification Certificate:** Extract Reg numbers, Dates, Assessment Center info (Fields 4.5/4.6).
*   **Process:** Client -> Gemini API -> JSON Extraction (Regex) -> UI.
*   **Fallback:** If JSON parsing fails or type is unknown, render `RawData` view.

### Document Templates
*   **File Support:** `.docx`.
*   **Variable Guide:**
    *   A modal providing a searchable list of available variables.
    *   **Format:** `{{snake_case_variable}}`.
    *   **UX:** Click-to-copy with visual feedback.
*   **Mapping:** Variables must correspond 1:1 with `types.ts` interfaces (`PassportData`, etc.).

---

## 5. Coding Standards

*   **Imports:**
    *   Icons: `import { IconName } from './icons';` (Always use the index).
    *   Types: `import { TypeName } from '../types';`
*   **Global Objects:**
    *   `window.pdfjsLib` must be typed via `declare global` in consuming components.
*   **Error Handling:**
    *   Gemini Service uses a Mock generator if `API_KEY` is missing.
    *   Parsing logic must use `try/catch` and Regex extraction to handle "chatty" AI responses.
*   **Naming:**
    *   Components: `PascalCase`
    *   Handlers: `handleAction` (e.g., `handleAnalyze`, `handleRemove`).
    *   Props: `onAction` (e.g., `onUpdate`, `onNavigate`).
