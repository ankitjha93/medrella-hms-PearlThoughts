# 🚀 Production Deployment Guide

This document outlines deployment strategies, operational procedures, and environment requirements for **Medrella HMS**.

---

## 1. Vercel Zero-Configuration Deployment (Recommended)

Medrella is pre-configured for seamless zero-credential deployment on **Vercel**.

### Step-by-Step Vercel Setup
1. **Push your code** to GitHub (`origin/feature/appointment-booking-app` or `main`).
2. **Import Repository**:
   - Go to [vercel.com](https://vercel.com) and click **Add New Project**.
   - Select your Medrella repository.
3. **Configure Build Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `frontend` (or leave default if deploying from root with root scripts).
   - **Build Command**: `next build --webpack` (or `npm run build`)
   - **Output Directory**: `.next`
4. **Environment Variables**:
   - **None required**. Medrella automatically initializes mock seed data and routes scratch writes to `/tmp/db.json`.
5. **Deploy**:
   - Click **Deploy**. The build will complete in ~30 seconds with 0 errors.

---

## 2. Docker Containerization (Alternative)

For containerized cloud environments (AWS ECS, Google Cloud Run, Azure Container Apps), use the following `Dockerfile` inside `frontend/`:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Running Docker Locally:
```bash
docker build -t medrella-hms frontend/
docker run -p 3000:3000 medrella-hms
```

---

## 3. Post-Deployment Smoke Verification
Run the automated verification suite against your deployed domain:

```powershell
node tests/run-tests.mjs --url https://your-app.vercel.app
```

