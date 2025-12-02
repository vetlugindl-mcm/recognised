
# Project Manifesto & Design System

> **Philosophy:** "Premium Utility". The interface should feel like a precision tool: monochromatic, tactile, fast, and distraction-free.

## 1. Tech Stack & Architecture

*   **Core:** React 19, TypeScript 5+, Vite.
*   **Styling:** Tailwind CSS (Utility-first) + CSS Modules (for specific animations).
*   **AI Engine:** Google Gemini API (`@google/genai`) - Model: `gemini-2.5-flash`.
*   **PDF Processing:** `pdf.js` (Client-side rendering for thumbnails).
*   **Routing:** Custom State-based Routing (Managed via `App.tsx` state).
*   **Icons:** Heroicons (SVG) via centralized `components/icons`.

### Architecture Patterns

1.  **State-Based Navigation:**
    *   We do not use `react-router-dom`.
    *   Navigation is controlled by a root state `currentView` in `App.tsx`.
    *   Views are swapped conditionally: `<TemplatesView />` vs `<DocumentScanner />`.

2.  **Layout Composition:**
    *   `DashboardLayout` is the single source of truth for the application shell.
    *   It manages the **Sidebar** (Desktop/Mobile states) and **Header**.
    *   It provides the global background texture (noise + radial gradients).

3.  **Data Flow:**
    *   **Optimistic UI:** Files appear instantly upon upload. Statuses update asynchronously.
    *   **Inline Editing:** Data displayed in `AnalysisResult` is editable. Changes update the local state immediately.

### Directory Structure
```
src/
├── components/
│   ├── icons/         # Single source of truth for ALL icons
│   ├── ui/            # Generic UI atoms (Buttons, Inputs)
│   ├── AnalysisResult.tsx # Complex data display component
│   ├── DashboardLayout.tsx # Main shell
│   ├── DocumentScanner.tsx # Core feature: OCR & Analysis
│   ├── TemplatesView.tsx   # Core feature: Template registry
│   └── ...
├── services/          # External integrations (gemini.ts)
├── types.ts           # Shared TypeScript interfaces (Domain entities)
├── styles.css         # Global styles & Design Tokens
└── App.tsx            # Root Controller
```

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
*   **Glassmorphism:** Used in `Header` and floating panels (`backdrop-blur-xl bg-white/80`).
*   **Shadows:** Soft, diffuse shadows (`shadow-xl shadow-gray-200/50`) to create depth without harsh lines.

---

## 3. Component Guidelines

### Sidebar & Navigation
*   **Desktop:** Fixed column.
*   **Mobile:** Off-canvas Drawer with backdrop. Triggered by `Bars3Icon` in Header.
*   **States:** Active items are highlighted with `bg-black text-white`.

### Dropzone (Universal)
*   **Props:** Must accept `title`, `subtitle`, `accept` (MIME types), and `onFilesAdded`.
*   **Behavior:** Supports both drag-and-drop and click-to-select.
*   **Visuals:** Dashed border. Expands/Contracts based on state, but generally keeps a tidy height.

### File List
*   **Previews:**
    *   **Images:** Native `URL.createObjectURL`.
    *   **PDFs:** Rendered to Canvas via `pdf.js`, exported as Base64 image.
*   **Status Lifecycle:**
    1.  `ClockIcon` (Queued)
    2.  `LoaderIcon` (Analyzing - Animated)
    3.  `CheckIcon` (Complete - Green)

### Analysis Result (Cards)
*   **Structure:** Header (Type info) -> Body (Grid of Fields) -> Footer (Status).
*   **Interaction:** Hovering over a field reveals Edit/Copy controls.
*   **Edit Mode:** Clicking the Pencil icon swaps `<span>` for `<input>`.

---

## 4. Feature Specifications

### Document Scanner (OCR)
*   **Route:** `scanner` (NOPRIZ) & `nostroy` (NOSTROY).
*   **Input:** JPG, PDF.
*   **Process:** Client -> Gemini API -> JSON Response -> UI.
*   **Output:** Structured data (Passport vs Diploma) or Raw Text.

### Document Templates
*   **Route:** `templates`.
*   **Input:** `.docx` files.
*   **Logic:** Frontend mocks parsing of `{{variable}}` patterns in filenames or content.
*   **UI:** Grid view of cards with file metadata and detected variable tags.

---

## 5. Coding Standards

*   **Imports:**
    *   Icons: `import { IconName } from './icons';` (Always use the index).
    *   Types: `import { TypeName } from '../types';`
*   **Naming:**
    *   Components: `PascalCase`
    *   Handlers: `handleAction` (e.g., `handleAnalyze`, `handleRemove`).
    *   Props: `onAction` (e.g., `onUpdate`, `onNavigate`).
*   **Responsiveness:**
    *   Mobile-First approach.
    *   Use `hidden md:flex` patterns for layout shifts.
    *   Ensure touch targets are at least 44px.
