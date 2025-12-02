
# Project Manifesto & Design System

> **Philosophy:** "Premium Utility". The interface should feel like a precision tool: monochromatic, tactile, fast, and distraction-free.

## 1. Tech Stack & Architecture

*   **Core:** React 19, TypeScript 5+, Vite (implied).
*   **Styling:** Tailwind CSS (Utility-first) + CSS Modules (for complex animations).
*   **AI Engine:** Google Gemini API (`@google/genai`).
*   **State Management:** React Hooks (`useState`, `useReducer`, `useContext`). Avoid Redux unless strictly necessary.

### Directory Structure (Feature-Based)
```
src/
├── components/        # Shared UI components (Buttons, Inputs, Cards)
│   ├── ui/            # "Dumb" visual components
│   └── layout/        # Layout wrappers (Sidebar, Header)
├── features/          # Business logic modules
│   └── scanner/       # e.g., DocumentScanner logic
├── services/          # API integrations (Gemini, Supabase, etc.)
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
└── assets/            # Static files
```

---

## 2. Design System (Material Design 3 Inspired)

### Color Palette (Monochrome)
We avoid colorful UI elements. Color is reserved for **Data** and **Errors**.

| Token | CSS Variable | Tailwind | Hex | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Surface** | `--bg-surface` | `bg-white` | `#FFFFFF` | Main cards, panels |
| **Background** | `--bg-app` | `bg-gray-50` | `#FAFAFA` | App background |
| **Text Primary** | `--text-primary` | `text-gray-900` | `#111827` | Headings, Main values |
| **Text Secondary**| `--text-secondary`| `text-gray-500` | `#6B7280` | Labels, Subtitles |
| **Text Tertiary** | `--text-tertiary` | `text-gray-400` | `#9CA3AF` | Icons, Placeholders |
| **Border** | `--border-subtle` | `border-gray-200` | `#E5E7EB` | Dividers, Card borders |
| **Accent** | `--accent` | `bg-black` | `#000000` | Primary Actions |

### Typography (Material Type Scale)
We strictly adhere to the Material Design 3 type scale to ensure readability and rhythm.

| Role | Size | Tailwind | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Headline Small** | 24px | `text-2xl` | Bold | Tight | Page Titles |
| **Title Large** | 22px | `text-xl` | Bold | Tight | Card Headers |
| **Body Large** | 16px | `text-base` | Regular | Normal | **Data Values**, Long text |
| **Body Medium** | 14px | `text-sm` | Medium | Normal | **Menu**, List Items, Inputs |
| **Label Medium** | 12px | `text-xs` | Medium | Wide | **Field Labels**, Metadata |
| **Label Small** | 11px | `text-[11px]`| Bold | Widest | Overlines, Badges |

### Spacing & Radius
*   **Grid:** 4px base unit.
*   **Padding:**
    *   Cards: `p-6` (24px) or `p-8` (32px).
    *   Small Items: `p-2` (8px).
*   **Radius:**
    *   Cards/Panels: `rounded-2xl` (16px).
    *   Inputs/Buttons: `rounded-xl` (12px).

### Effects & Texture
*   **Glassmorphism:** `backdrop-blur-xl` + `bg-white/80` for floating elements (Header).
*   **Noise:** A subtle SVG noise texture overlay with `opacity-5` on the main background to add tactility.
*   **Shadows:** Ultra-soft, diffuse shadows. `shadow-xl shadow-gray-200/50`.

---

## 3. UI Component Guidelines

### Buttons
*   **Primary:** Solid Black background, White text. No border. Hover: Scale 105%.
*   **Secondary:** White background, Gray-200 border. Hover: Gray-50.
*   **Ghost:** Transparent background. Hover: Gray-100.

### Cards (Glass Panels)
Cards should look like physical sheets of frosted glass.
```tsx
className="glass-panel rounded-2xl border border-gray-100 shadow-sm"
```

### Input Fields / Dropzones
*   dashed borders for dropzones.
*   Solid subtle borders for inputs.
*   Focus state: Black border (`ring-1 ring-black`).

---

## 4. Responsiveness (Mobile First)

### Breakpoints
*   `sm`: 640px (Mobile Landscape)
*   `md`: 768px (Tablets)
*   `lg`: 1024px (Laptops)
*   `xl`: 1280px (Desktops)

### Strategies
1.  **Sidebar:**
    *   **Desktop:** Fixed left sidebar.
    *   **Mobile:** Hidden by default, accessible via Hamburger menu (Drawer) or converted to a Bottom Navigation Bar.
2.  **Grids:**
    *   **Desktop:** 2-column layout for Analysis Results.
    *   **Mobile:** 1-column layout (Stack).
3.  **Typography:**
    *   Scale down H1/H2 sizes on mobile to prevent wrapping.

---

## 5. Coding Standards

*   **Naming:**
    *   Components: `PascalCase.tsx`
    *   Functions: `camelCase`
    *   Constants: `UPPER_SNAKE_CASE`
*   **Exports:** Use Named Exports (`export const Component = ...`) instead of Default Exports.
*   **Typing:** strict `interface` definitions for all props. No `any`.
*   **Accessibility (a11y):**
    *   All interactive elements must have `aria-label` if they contain no text.
    *   Colors must pass WCAG AA contrast ratio.

---

## 6. Git & Commits
*   Feat: `feat: add document scanner`
*   Fix: `fix: resolve mobile overflow`
*   Refactor: `refactor: extract sidebar component`
*   Style: `style: update border radius`
