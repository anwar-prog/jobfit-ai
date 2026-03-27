import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS: Record<string, { system: string; buildUser: (jd: string, cv: string, rewrittenCv?: string) => string }> = {
  step1: {
    system: `You are a senior recruiter. Analyze job descriptions and extract structured, concise insights. Be direct and specific. No fluff.`,
    buildUser: (jd) => `Analyze this job description and return a clean, structured breakdown:

**Job Description:**
${jd}

Format your response with these sections:
**Role in One Line:** (what is this job, really)
**Key Requirements:** (bullet list, max 8 items — only the genuinely important ones)
**Nice-to-Haves:** (bullet list, max 5 — optional/preferred skills)
**What They Actually Want:** (2-3 sentences on the real person they're hiring — read between the lines)
**Red Flags / Watch-outs:** (anything unusual, demanding, or ambiguous in this JD)

Keep everything tight. No padding.`
  },

  step1combined: {
    system: `You are a senior recruiter AND brutally honest hiring manager combined. First concisely break down the job, then give a direct fit assessment. Note: CV may be PDF-extracted text — interpret intelligently.`,
    buildUser: (jd: string, cv: string) => `Do TWO things in sequence for this job description and CV:

**PART 1 — JD BREAKDOWN**
**Role in One Line:** (what is this job, really)
**Key Requirements:** (bullet list, max 6 — only genuinely important ones)
**What They Actually Want:** (1-2 sentences reading between the lines)
**Red Flags / Watch-outs:** (anything unusual or demanding)

**PART 2 — FIT REVIEW**
**Overall Verdict:** [Strong Fit / Partial Fit / Weak Fit] — one sentence why.
**What matches:** (3-4 bullet points, specific)
**What's missing or weak:** (3-4 bullet points, no softening)
**One thing to fix immediately:** (1 sentence)

Keep everything tight and direct. No padding.

**Job Description:**
${jd}

**CV:**
${cv}`
  },

  step2: {
    system: `You are a brutally honest hiring manager. You give short, direct assessments. No sugarcoating. No corporate speak. Note: the CV text may have been extracted from a PDF and could appear as continuous text — interpret the content intelligently regardless of formatting.`,
    buildUser: (jd, cv) => `Compare this CV against the job description and give a brutal, honest fit assessment.

**Job Description:**
${jd}

**CV:**
${cv}

Your response format — keep it SHORT and DIRECT:

**Overall Verdict:** [Strong Fit / Partial Fit / Weak Fit] — one sentence why.

**What matches:** (3-5 bullet points, specific)
**What's missing or weak:** (3-5 bullet points, specific, no softening)
**Biggest risk a recruiter will see:** (1-2 sentences)
**One thing to fix immediately:** (1 sentence)

Do NOT over-explain. No filler. Harsh if needed.`
  },

  step3: {
    system: `You are an expert CV writer and career coach. You improve CVs by enhancing clarity, impact, and relevance — without inventing experience. Note: the CV may have been extracted from a PDF and could appear as continuous or loosely formatted text — intelligently reconstruct the structure from context before rewriting.`,
    buildUser: (jd, cv) => `Rewrite and optimize this CV to better match the job description below.

STRICT RULES:
- Do NOT add experience or accomplishments that are not in the original CV
- Keep the EXACT same structure, sections, and number of bullet points per role/section — if a role has 3 bullets, keep exactly 3
- Only improve: wording, action verbs, specificity, relevance, and impact language
- Align the language and keywords with the job description
- Make it more professional and results-focused
- Do not change job titles, dates, companies, or education facts
- Output the full rewritten CV — preserve all original sections

**Job Description:**
${jd}

**Original CV:**
${cv}

Output only the rewritten CV. No explanations, no before/after commentary.`
  },

  step4: {
    system: `You are an expert in German-style professional applications. You write cover letters that are concise, direct, formal, and effective — following German Bewerbung conventions in English.`,
    buildUser: (jd, _cv, rewrittenCv) => `Write a professional German-style cover letter in English based on the job description and the optimised CV below.

Requirements:
- 180–200 words total
- 3–4 short paragraphs
- Para 1: Clear opening referencing the specific position and company
- Para 2–3: Link key skills, experience, and achievements from the CV to the job requirements
- Para 4: Express motivation, cultural fit, availability, and interest in an interview
- Tone: Formal, confident, direct, modestly persuasive (German business style)
- Do NOT repeat the CV verbatim — synthesize and connect
- Do NOT invent new experience
- End with a polite closing

**Job Description:**
${jd}

**Optimised CV:**
${rewrittenCv}

Output only the cover letter. No meta-commentary.`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { step, jdText, cvText, rewrittenCv, lang } = await req.json()

    if (!step || !jdText || !cvText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const promptConfig = PROMPTS[step]
    if (!promptConfig) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    const langInstruction = lang === 'DE' ? ' Respond entirely in German.' : ' Respond entirely in English.'
    const userPrompt = promptConfig.buildUser(jdText, cvText, rewrittenCv)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: promptConfig.system + langInstruction,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const result = message.content.map((b) => ('text' in b ? b.text : '')).join('')
    return NextResponse.json({ result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
