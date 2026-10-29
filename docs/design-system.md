# 🎨 Medrella Design System & UI Tokens

This document defines the color palette, typography, button states, surface hierarchy, and accessibility rules for **Medrella HMS**.

---

## 1. Color Palette & Medical Tokens

Medrella uses an emerald, teal, and slate color system inspired by clinical cleanroom aesthetics.

| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `#059669` (`emerald-600`) | `#10b981` (`emerald-500`) | Primary buttons, active indicators, brand accents |
| **Primary Hover** | `#047857` (`emerald-700`) | `#059669` (`emerald-600`) | Interactive hover state for primary elements |
| **Secondary Accent**| `#0f766e` (`teal-700`) | `#14b8a6` (`teal-400`) | OPD queue badges, revenue metrics, secondary pills |
| **Clinical Blue** | `#2563eb` (`blue-600`) | `#3b82f6` (`blue-500`) | Completed status badges, Rx prescription buttons |
| **Alert Red** | `#dc2626` (`red-600`) | `#ef4444` (`red-500`) | Cancel buttons, error banners, slot rejections |
| **Surface Base** | `#ffffff` (`bg-white`) | `#090d16` (`dark:bg-slate-950`)| Page body background |
| **Surface Card** | `#f8fafc` (`bg-slate-50`) | `#0f172a` (`dark:bg-slate-900`)| Modals, consultation cards, table rows |
| **Border Neutral** | `#e2e8f0` (`border-slate-200`)| `#1e293b` (`dark:border-slate-800`)| Component dividers, card borders |
| **Text Primary** | `#0f172a` (`text-slate-900`)| `#f8fafc` (`dark:text-white`)| Headings, doctor titles, patient names |
| **Text Secondary** | `#64748b` (`text-slate-500`)| `#94a3b8` (`dark:text-slate-400`)| Metadata, hours, hospital addresses |

---

## 2. Typography & Scale

- **Heading 1**: `text-3xl font-extrabold tracking-tight` (Page titles, hero heading)
- **Heading 2**: `text-2xl font-bold` (Section headers, queue titles)
- **Heading 3**: `text-lg font-bold` (Card titles, modal headers)
- **Body Regular**: `text-sm font-medium` (Descriptions, symptoms text)
- **Metadata / Caption**: `text-xs font-semibold` (Tags, timestamps, button text)
- **Mono / Reference**: `font-mono text-[11px]` (Booking IDs, token numbers e.g. `#OPD-01`)

---

## 3. Component Standards

### Buttons
- **Primary CTA**: `px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm`
- **Secondary / Action**: `px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold dark:bg-slate-800 dark:text-slate-200`
- **Destructive**: `px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200`

### Modals & Drawers
- **Backdrop**: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200`
- **Modal Container**: `relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`

---

## 4. Accessibility & Print Standards

1. **Print Styles (`@media print`)**:
   - The Medical Slip is optimized for `window.print()` with clean white backgrounds, high-contrast dark text, hidden navigation elements, and crisp vector lines.
2. **Focus Indicators**:
   - All interactive inputs and buttons feature `focus:ring-2 focus:ring-emerald-500` for keyboard navigation.
3. **Contrast Compliance**:
   - All text and badge color pairings meet WCAG AA contrast ratio of at least 4.5:1 against light and dark backgrounds.

