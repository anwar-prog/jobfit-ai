# JobFit AI

A Next.js application that analyzes job descriptions, reviews CV fit, rewrites your CV, and generates a German-style cover letter — powered by the Anthropic Claude API.

---

## What it does

1. **Job Description Breakdown** — Concise summary of requirements, nice-to-haves, and what the company really wants
2. **Brutal Fit Review** — Honest assessment of how your CV matches the role
3. **CV Rewrite** — Optimized CV aligned to the job description (same structure, improved language)
4. **German-Style Cover Letter** — Professional 180–200 word cover letter in English following German Bewerbung conventions

---

## Setup & Running Locally

### 1. Prerequisites

Make sure you have **Node.js** installed (version 18 or newer).

Check if you have it:
```bash
node --version
```

If not, download from: https://nodejs.org (choose the LTS version)

---

### 2. Extract the project

Unzip the downloaded file anywhere you like. Recommended location:

- **Windows:** `C:\Users\YourName\Projects\jobfit-ai`
- **Mac/Linux:** `~/Projects/jobfit-ai`

---

### 3. Set up your API key

In the project folder, create a file called `.env.local` (copy from `.env.local.example`):

```bash
# On Mac/Linux:
cp .env.local.example .env.local

# On Windows (Command Prompt):
copy .env.local.example .env.local
```

Then open `.env.local` and fill in your key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> **Can I use the same API key I use for other tools?**
> Yes — Anthropic API keys work across all projects and tools. There is no need to create a new key.
> Just paste the same `sk-ant-...` key you already have.

---

### 4. Install dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This downloads all required packages (~1 minute).

---

### 5. Run locally

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

---

## Deploying to the web (share with others)

### Option A — Vercel (easiest, free)

1. Push the project to GitHub
2. Go to https://vercel.com → "New Project" → import your repo
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add: `ANTHROPIC_API_KEY` = your key
5. Deploy — you get a public URL like `https://jobfit-ai.vercel.app`

### Option B — Netlify

Similar to Vercel. Add the env variable in **Site Settings → Environment Variables**.

---

## Project Structure

```
jobfit-ai/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts   ← API route (calls Anthropic)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       ├── JobFitApp.tsx          ← Main UI component
│       └── JobFitApp.module.css   ← Styles
├── .env.local.example             ← Copy this to .env.local
├── package.json
└── next.config.js
```

---

## Notes

- The API key is **never exposed to the browser** — all Anthropic calls go through the Next.js API route (`/api/analyze`)
- Each job analysis is independent — upload a new JD anytime
- For best text extraction, paste text directly rather than uploading PDFs
