# 🩺 Developer Debugging Quick Reference

Quick solutions for the most common errors and edge cases encountered in **Medrella HMS**.

---

## 1. Port 3000 Collision ("Port 3000 is already in use")
- **Cause**: An orphan Node or Next.js background process is holding port 3000.
- **Fix (PowerShell)**:
  ```powershell
  # Check PID on port 3000
  Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object OwningProcess, State

  # Terminate orphan process
  Stop-Process -Id <PID> -Force
  ```

---

## 2. Next.js 16 Static Prerendering Error (`new Date()`)
- **Error**: `Route "/": Next.js encountered the unstable value new Date() in a Client Component`.
- **Cause**: Next.js 16 App Router prerenders client components at build time. Direct `new Date()` calls create hydration mismatches.
- **Fix**:
  - In dynamic forms (like `BookingModal.tsx`), initialize date state inside a `useEffect` hook.
  - In static components (footer copyright), use a constant string like `"2026"`.

---

## 3. Tailwind CSS v4 Dark Mode Not Switching
- **Cause**: Tailwind CSS v4 defaults to `@media (prefers-color-scheme)` and ignores `.dark` on `<html>` unless declared as a custom variant.
- **Fix**: Verify `src/app/globals.css` declares:
  ```css
  @import "tailwindcss";
  @custom-variant dark (&:where(.dark, .dark *));
  ```

---

## 4. Turbopack Process Disconnection on Windows
- **Error**: `TurbopackInternalError: node process exited before we could connect to it with exit code: 0`.
- **Cause**: Turbopack child loader process pipe issue on Windows with cloud-synced folders.
- **Fix**: Build with webpack in `package.json`:
  ```json
  "build": "next build --webpack"
  ```

---

## 5. Vercel Serverless File System Error (`EROFS: read-only`)
- **Cause**: Vercel serverless functions have a read-only filesystem outside `/tmp`.
- **Fix**: Always route serverless writes to `/tmp`:
  ```typescript
  const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
  ```
