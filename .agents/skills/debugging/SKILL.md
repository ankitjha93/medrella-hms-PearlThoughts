---
name: debugging
description: Diagnostic playbook for resolving Next.js 16 build panics, Tailwind v4 dark mode issues, port conflicts, and serverless crashes.
---

# 🩺 Debugging Playbook for Medrella HMS

When encountering errors in Medrella HMS, apply these verified solutions:

## 1. Port 3000 Collision / "Another next dev server is already running"
- **Symptom**: `npm run dev` fails with `Port 3000 is in use by PID XXXX`.
- **Diagnostic Command**:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess, State
  ```
- **Fix**:
  ```powershell
  Stop-Process -Id <OwningProcess> -Force
  ```

## 2. Next.js 16 Static Prerendering Error: `new Date()`
- **Symptom**: `Route "/": Next.js encountered the unstable value new Date() in a Client Component`.
- **Root Cause**: Next.js 16 prerenders static HTML. Direct invocation of `new Date()` in the render body creates hydration mismatches.
- **Fix**:
  - In components needing the current date (e.g. `BookingModal.tsx`), initialize state in a `useEffect` hook.
  - In static labels (like copyright year), use a constant string (`2026`).

## 3. Tailwind CSS v4 Dark Mode Not Responding
- **Symptom**: Adding `.dark` to the HTML tag does not change colors, or dark mode only responds to OS system settings.
- **Root Cause**: Tailwind CSS v4 defaults to `@media (prefers-color-scheme)` and ignores class toggling unless explicitly configured.
- **Fix**: Ensure `src/app/globals.css` starts with:
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```

## 4. Turbopack Process Panic During `next build` on Windows
- **Symptom**: `node process exited before we could connect to it with exit code: 0`.
- **Fix**: Build with webpack in `package.json`:
  ```json
  "build": "next build --webpack"
  ```

