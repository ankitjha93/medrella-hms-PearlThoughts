# TASK-006: Patient Electronic Medical Record (EMR) Timeline & Prescription History Search

## 1. Overview & Objective
Enhance the Patient Portal with an interactive chronological health timeline, allowing patients to view, search, and filter historical diagnoses, prescribed medications, laboratory advice, and doctor consultation slips.

---

## 2. User Story
- **As a**: Patient with multiple outpatient consultations (`John Doe`)
- **I want to**: Search through my medical history by medicine name, diagnosis, or doctor name
- **So that**: I can easily review past treatment plans and download historical EHR slips.

---

## 3. Detailed Requirements
- Search bar across past consultations (filter by medicine name e.g. "Metoprolol", diagnosis, or doctor).
- Chronological timeline view with diagnostic tags.
- 1-click re-download or print of EHR consultation slips.
- Medication active vs completed status indicator.

---

## 4. Acceptance Criteria
- [ ] Patient can filter consultation history using live search.
- [ ] Timeline displays past consultations in chronological order.
- [ ] Each consultation displays diagnosis, doctor name, and list of medicines.
- [ ] Production build succeeds with 0 errors (`npm run build`).

---

## 5. Affected Files & Endpoints
- `frontend/src/app/patient/page.tsx`: Add search and timeline filter.
- `frontend/src/lib/types.ts`: Update appointment/EHR search fields.

---

## 6. Definition of Done (DoD)
- [ ] Code passes TypeScript check with 0 errors.
- [ ] Production build succeeds (`npm run build`).
- [ ] Documented in `progress.md` and `CHANGELOG.md`.
