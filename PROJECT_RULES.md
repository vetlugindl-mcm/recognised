
# Project Rules & Guidelines

## 1. Technology Stack
*   **Framework:** React 18+ (Functional Components, Hooks).
*   **Language:** TypeScript (Strict typing required).
*   **Styling:** Tailwind CSS (Utility-first).
*   **AI Integration:** Google Gemini API (`@google/genai`).
*   **Icons:** Heroicons (SVG components).

## 2. File Structure
*   `index.tsx` & `index.html`: Entry points.
*   `App.tsx`: Main application orchestrator / Dashboard layout root.
*   `components/`: Reusable UI components.
    *   `DocumentScanner.tsx`: Core logic for file upload and analysis.
    *   `Sidebar.tsx`: Left navigation menu.
    *   `Header.tsx`: Top bar with user actions.
    *   `AnalysisResult.tsx`: Display of parsed data.
*   `services/`: External API logic (Gemini).
*   `types.ts`: Shared TypeScript interfaces.
*   `styles.css`: Global styles.

## 3. Coding Standards
*   **Typing:** No `any`. Use interfaces defined in `types.ts`.
*   **State Management:** Use `useState` and `useCallback` for local state.
*   **Error Handling:** All API calls must be wrapped in `try/catch`.
*   **Formatting:** Use 2 spaces for indentation.

## 4. UI/UX Guidelines (PREMIUM MONOCHROME)
*   **Aesthetic:** "Premium Tech". High-end, tactile, monochromatic.
*   **Palette:** Strict Black, White, and Gray scale.
    - Primary Action: Solid Black (#000).
    - Surface: White with subtle noise or glass effect.
    - Borders: Extremely subtle (Black/5%).
*   **Texture:** Use noise/grain and "Glassmorphism" (backdrop-blur) to add depth.
*   **Motion:** Animations should be fluid (cubic-bezier) and subtle (fade-in-up).
*   **Typography:** Inter font. Tight tracking for headings, wide tracking for labels.

## 5. Gemini API Usage
*   **Authentication:** Use `process.env.API_KEY`.
*   **Models:** Use `gemini-2.5-flash` for OCR tasks.
*   **Prompting:** Instruct the model to return strict JSON.

## 6. Business Logic
*   **Supported Files:** JPG, PDF, DOC/DOCX.
*   **Priority:** Passport data must always appear first.
*   **Multi-file:** Support simultaneous analysis.
