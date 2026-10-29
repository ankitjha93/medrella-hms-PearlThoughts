---
name: api-development
description: Standards for developing and maintaining Next.js App Router REST API route handlers in Medrella HMS.
---

# ⚡ API Development Skill for Medrella HMS

Follow these standards when writing or modifying Next.js 16 route handlers:

## 1. Route Handler Architecture
1. **Directory Location**: All API handlers live under `src/app/api/`.
2. **Next.js 16 Dynamic Parameters**:
   - In Next.js 16, route parameters (`params`) are promises and must be awaited:
     ```typescript
     export async function PATCH(
       request: NextRequest,
       { params }: { params: Promise<{ id: string }> }
     ) {
       const { id } = await params;
       // ...
     }
     ```
3. **HTTP Methods**:
   - Use standard verbs: `GET` (read), `POST` (create), `PATCH` (update partial state / prescription), `DELETE` (remove).

## 2. Response Shape Contract
All responses must adhere to the standard envelope format:
- **Success (`200 OK` / `201 Created`)**:
  ```json
  {
    "success": true,
    "appointment": { ... }
  }
  ```
- **Error (`400 Bad Request` / `404 Not Found` / `409 Conflict`)**:
  ```json
  {
    "success": false,
    "error": "Human-readable error explanation"
  }
  ```

## 3. Validation Checklist
- Always validate required body fields before calling `db.ts` functions.
- If a client attempts to book an already occupied slot, return `409 Conflict` with clear instructions.
- Never crash the server process on malformed JSON; wrap parsing in `try/catch` and return `500` or `400`.

