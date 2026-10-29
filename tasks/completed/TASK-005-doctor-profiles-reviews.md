# TASK-005: Doctor Profile Pages (`/doctors/[id]`) & Patient Reviews System

## 1. Overview & Objective
Build a dedicated doctor profile page (`/doctors/[id]`) providing detailed clinical credentials, verified patient reviews, hospital affiliations, consultation fees, and direct in-page appointment booking.

---

## 2. User Stories
1. **As a Patient**:
   - I want to click on any doctor card in `/doctors` or from search results to view their full clinical background, credentials, languages spoken, and patient ratings.
   - I want to read verified reviews from past patients before scheduling.
   - I want to submit a 1–5 star rating with feedback after completing a consultation.
2. **As a Doctor**:
   - I want patients to see my verified board certifications, publications, hospital room, and clinic hours.

---

## 3. Detailed Requirements

### Frontend (`/doctors/[id]`)
- Dynamic route: `frontend/src/app/doctors/[id]/page.tsx` + `DoctorProfileClient.tsx`.
- Profile Header:
  - Doctor avatar / initials badge with specialty badge.
  - Full name, qualifications (e.g. `MD, FACC, Board Certified Cardiologist`).
  - Star rating average with total reviews count (e.g. `⭐ 4.9 (128 reviews)`).
  - Hospital affiliation (`City General Hospital - OPD Wing B, Room 402`).
  - Consultation fee (`$75 / 30 mins`).
- Tabbed or structured sections:
  1. **Overview & Clinical Focus**: Bio, clinical interests, education, and years of experience.
  2. **Practicing Schedule**: Weekly OPD rota (e.g. Monday–Friday 09:00–17:00).
  3. **Patient Reviews & Ratings**:
     - List of verified patient reviews with author, date, star rating, and comment.
     - Interactive **"Write a Review"** form (Rating selector 1–5 stars, review comment, patient name).
- Direct **"Book Consultation"** button opening the `BookingModal` pre-selected to this doctor.

### Backend (`/api/doctors/[id]/reviews` and `GET /api/doctors/[id]`)
- `GET /api/doctors/[id]`: Returns full doctor object including reviews list and rating breakdown.
- `POST /api/doctors/[id]/reviews`:
  - Validates `rating` (1–5) and `comment`.
  - Appends review to doctor record.
  - Recalculates doctor average `rating` and `reviewsCount`.
  - Persists to database.

---

## 4. Acceptance Criteria
- [x] Navigating to `/doctors/doc_1` or `/doctors/doc_2` renders the dedicated profile page with 0 errors.
- [x] Page displays doctor's photo/badge, specialty, bio, credentials, and weekly shift hours.
- [x] Patient reviews list renders accurately with verified visit badges.
- [x] Patients can submit a new review with 1–5 star rating and comment; average rating updates dynamically.
- [x] Clicking "Book Appointment" opens the `BookingModal` with the doctor pre-selected.
- [x] TypeScript compiles with 0 errors (`npm run build`).

---

## 5. Affected Files & Endpoints
- `frontend/src/lib/types.ts`: Added `DoctorReview` interface and `reviews?: DoctorReview[]` to `Doctor`.
- `frontend/src/lib/mockData.ts`: Added initial verified reviews for specialists.
- `frontend/src/lib/db.ts`: Added `addDoctorReview` and preserved reviews in `normalizeDoctor`.
- `frontend/src/app/api/doctors/[id]/reviews/route.ts`: POST endpoint to submit reviews.
- `frontend/src/app/doctors/[id]/page.tsx`: Server Component with `generateStaticParams()`.
- `frontend/src/app/doctors/[id]/DoctorProfileClient.tsx`: Client profile view with review submission.
- `frontend/src/app/doctors/page.tsx`: Linked doctor cards to `/doctors/${doc.id}`.
- `tests/run-tests.mjs`: Added automated test for `POST /api/doctors/doc_1/reviews`.

---

## 6. Definition of Done (DoD)
- [x] Automated REST check verifies `POST /api/doctors/doc_1/reviews` (7/7 tests pass).
- [x] Production build succeeds with 0 errors across 15 routes.
- [x] Documented in `progress.md` and `CHANGELOG.md`.
