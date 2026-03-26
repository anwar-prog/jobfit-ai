'use client'

import { useState, useRef } from 'react'
import styles from './JobFitApp.module.css'

type Step = 0 | 1 | 2 | 3 | 4
type Results = { step1: string; step2: string; step3: string; step4: string }

const STEP_LABELS_EN = ['Upload', 'Breakdown', 'Fit Review', 'CV Rewrite', 'Cover Letter'] // kept for length ref
const STEP_COLORS = ['', 'var(--step1)', 'var(--step2)', 'var(--step3)', 'var(--step4)']

const T = {
  EN: {
    tagline: 'Craft. Tailor. Apply.',
    newApp: '↺ New Application',
    steps: ['Upload', 'Breakdown', 'Fit Review', 'CV Rewrite', 'Cover Letter'],
    cardTitle: 'Your Documents',
    jdLabel: 'Job Description',
    jdPlaceholder: 'Paste the job description here...',
    cvLabel: 'Your CV / Resume',
    uploadHint: 'Click to upload',
    uploadDrag: 'or drag & drop',
    uploadSub: '.txt · .pdf · .docx',
    orPaste: 'or paste text',
    cvPlaceholder: 'Paste your CV / resume here...',
    extracting: 'Extracting PDF...',
    analyse: 'Analyse →',
    tip: 'PDFs are parsed automatically. For best results with complex layouts, paste your CV text directly. Your documents are not stored.',
    next: 'Next',
    back: '← Back',
    nextFit: 'Next: Fit Review →',
    nextCV: 'Next: Rewrite CV →',
    nextCover: 'Next: Cover Letter →',
    step1Title: '{t.step1Title}',
    step2Title: '{t.step2Title}',
    step3Title: 'Optimised CV',
    step4Title: 'Cover Letter',
    tabRewritten: 'Rewritten',
    tabOriginal: 'Original',
    loadingStep1: 'Breaking down the job description...',
    loadingStep2: 'Running brutal fit analysis...',
    loadingStep3: 'Rewriting and optimising your CV...',
    loadingStep4: 'Writing your German-style cover letter...',
    doneTitle: "You're application-ready ✦",
    doneText: 'All steps are complete. Copy what you need above to complete your current application. Or start fresh with a new job :)',
    copy: '⎘ Copy',
    copied: '✓ Copied!',
    footer: 'All rights reserved · Zahir Hussain',
    errJD: 'Please provide a job description.',
    errCV: 'Please provide your CV.',
  },
  DE: {
    tagline: 'Erstellen. Anpassen. Bewerben.',
    newApp: '↺ Neue Bewerbung',
    steps: ['Upload', 'Analyse', 'Passgenauigkeit', 'Lebenslauf', 'Anschreiben'],
    cardTitle: 'Ihre Dokumente',
    jdLabel: 'Stellenbeschreibung',
    jdPlaceholder: 'Stellenbeschreibung hier einfügen...',
    cvLabel: 'Ihr Lebenslauf',
    uploadHint: 'Klicken zum Hochladen',
    uploadDrag: 'oder per Drag & Drop',
    uploadSub: '.txt · .pdf · .docx',
    orPaste: 'oder Text einfügen',
    cvPlaceholder: 'Lebenslauf hier einfügen...',
    extracting: 'PDF wird verarbeitet...',
    analyse: 'Analysieren →',
    tip: 'PDFs werden automatisch verarbeitet. Für beste Ergebnisse bei komplexen Layouts den Text direkt einfügen. Ihre Dokumente werden nicht gespeichert.',
    next: 'Weiter',
    back: '← Zurück',
    nextFit: 'Weiter: Passgenauigkeit →',
    nextCV: 'Weiter: Lebenslauf →',
    nextCover: 'Weiter: Anschreiben →',
    step1Title: 'Analyse der Stellenbeschreibung',
    step2Title: 'Passgenauigkeitsanalyse',
    step3Title: 'Optimierter Lebenslauf',
    step4Title: 'Anschreiben',
    tabRewritten: 'Überarbeitet',
    tabOriginal: 'Original',
    loadingStep1: 'Stellenbeschreibung wird analysiert...',
    loadingStep2: 'Passgenauigkeit wird geprüft...',
    loadingStep3: 'Lebenslauf wird optimiert...',
    loadingStep4: 'Anschreiben wird verfasst...',
    doneTitle: 'Ihre Bewerbung ist fertig ✦',
    doneText: 'Alle Schritte abgeschlossen. Kopieren Sie was Sie benötigen oder starten Sie eine neue Bewerbung :)',
    copy: '⎘ Kopieren',
    copied: '✓ Kopiert!',
    footer: 'Alle Rechte vorbehalten · Zahir Hussain',
    errJD: 'Bitte geben Sie eine Stellenbeschreibung an.',
    errCV: 'Bitte geben Sie Ihren Lebenslauf an.',
  }
}

export default function JobFitApp() {
  const [step, setStep] = useState<Step>(0)
  const [jdText, setJdText] = useState('')
  const [cvText, setCvText] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [cvParsing, setCvParsing] = useState(false)
  const [results, setResults] = useState<Results>({ step1: '', step2: '', step3: '', step4: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cvTab, setCvTab] = useState<'rewritten' | 'original'>('rewritten')
  const [copied, setCopied] = useState<string | null>(null)
  const [cvDrag, setCvDrag] = useState(false)
  const [lang, setLang] = useState<'EN' | 'DE'>('EN')
  const t = T[lang]

  const switchLang = (newLang: 'EN' | 'DE') => {
    if (newLang === lang) return
    setLang(newLang)
    // Clear results so AI regenerates in the selected language
    setResults({ step1: '', step2: '', step3: '', step4: '' })
    if (step > 0) setStep(1)  // go back to step 1 if mid-flow
  }

  // FIX: useRef to always have latest values in async callbacks — avoids stale closure
  const jdRef = useRef(jdText)
  const cvRef = useRef(cvText)
  jdRef.current = jdText
  cvRef.current = cvText

  const callApi = async (stepKey: string, extra?: { rewrittenCv?: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // FIX: read from refs so we always get the latest values
        body: JSON.stringify({ step: stepKey, jdText: jdRef.current, cvText: cvRef.current, lang, ...extra })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      return data.result as string
    } finally {
      setLoading(false)
    }
  }

  // FIX: Proper PDF structure-aware extraction using pdf.js
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()

    if (!window.pdfjsLib) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load PDF parser'))
        document.head.appendChild(script)
      })
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    }

    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const allLines: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()

      // FIX: Group items by Y position to reconstruct lines properly
      interface TextItem { str: string; transform: number[] }
      const items = content.items as TextItem[]

      // Sort by Y descending (top of page first), then X ascending
      const sorted = [...items].sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5]
        if (Math.abs(yDiff) > 3) return yDiff  // different lines
        return a.transform[4] - b.transform[4]  // same line, left to right
      })

      // Group into lines by Y coordinate proximity
      const lineGroups: TextItem[][] = []
      let currentGroup: TextItem[] = []
      let lastY: number | null = null

      for (const item of sorted) {
        if (!item.str.trim()) continue
        const y = Math.round(item.transform[5])
        if (lastY === null || Math.abs(y - lastY) <= 3) {
          currentGroup.push(item)
        } else {
          if (currentGroup.length > 0) lineGroups.push(currentGroup)
          currentGroup = [item]
        }
        lastY = y
      }
      if (currentGroup.length > 0) lineGroups.push(currentGroup)

      // Join each line group into a text line
      for (const group of lineGroups) {
        const line = group.map(item => item.str.trim()).filter(Boolean).join(' ')
        if (line) allLines.push(line)
      }

      // Page separator
      if (i < pdf.numPages) allLines.push('')
    }

    return allLines.join('\n')
  }

  const handleCvFile = async (file: File) => {
    setCvParsing(true)
    setCvFileName(file.name)
    setCvText('')
    try {
      let text = ''
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await extractPdfText(file)
      } else {
        text = await new Promise<string>((res, rej) => {
          const r = new FileReader()
          r.onload = (e) => res(e.target?.result as string)
          r.onerror = () => rej(new Error('Read failed'))
          r.readAsText(file)
        })
      }
      if (!text.trim()) {
        setCvFileName('')
        alert('Could not extract text from this file. Please paste your CV text directly into the box below.')
        return
      }
      setCvText(text)
      // FIX: also update ref immediately so button check sees the new value
      cvRef.current = text
    } catch (e) {
      setCvFileName('')
      alert('Could not read this file. Please paste your CV text directly into the box below.')
      console.error(e)
    } finally {
      setCvParsing(false)
    }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // FIX: No useCallback — plain async functions reading from refs
  const runStep1 = async () => {
    if (!jdRef.current.trim()) { setError(t.errJD); return }
    if (!cvRef.current.trim()) { setError(t.errCV); return }
    setStep(1)
    if (results.step1) return
    try {
      const r = await callApi('step1')
      setResults(p => ({ ...p, step1: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(0) }
  }

  const runStep2 = async () => {
    setStep(2)
    if (results.step2) return
    try {
      const r = await callApi('step2')
      setResults(p => ({ ...p, step2: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(1) }
  }

  const runStep3 = async () => {
    setStep(3)
    if (results.step3) return
    try {
      const r = await callApi('step3')
      setResults(p => ({ ...p, step3: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(2) }
  }

  const runStep4 = async (rewrittenCv: string) => {
    setStep(4)
    if (results.step4) return
    try {
      const r = await callApi('step4', { rewrittenCv })
      setResults(p => ({ ...p, step4: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(3) }
  }

  const reset = () => {
    setStep(0); setJdText(''); setCvText(''); setCvFileName('')
    jdRef.current = ''; cvRef.current = ''
    setResults({ step1: '', step2: '', step3: '', step4: '' }); setError('')
  }

  const fmt = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return <div key={i} className={styles.heading}>{line.slice(2, -2)}</div>
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      const rendered = parts.map((p, j) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={j} className={styles.bold}>{p.slice(2, -2)}</strong>
          : p
      )
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <div key={i} className={styles.bullet}><span className={styles.bulletDot}>›</span><span>{rendered}</span></div>
      }
      if (line === '') return <div key={i} className={styles.spacer} />
      return <div key={i} className={styles.line}>{rendered}</div>
    })
  }

  const getVerdict = (text: string) => {
    const m = text.match(/Overall Verdict:\*?\*?\s*(Strong Fit|Partial Fit|Weak Fit)/i)
    return m ? m[1] : ''
  }

  // Navigate to a step by index (used by clickable progress labels)
  const goToStep = (i: number) => {
    if (i === 0) { setStep(0); return }
    if (i === 1 && results.step1) { setStep(1); return }
    if (i === 2 && results.step2) { setStep(2); return }
    if (i === 3 && results.step3) { setStep(3); return }
    if (i === 4 && results.step4) { setStep(4); return }
  }

  return (
    <div className={styles.root}>
      {/* BG mesh */}
      <div className={styles.bgMesh} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <div className={styles.logo}>Bewerb<span>AI</span></div>
            <div className={styles.tagline}>{t.tagline}</div>
          </div>
          <div className={styles.headerRight}>
            {step > 0 && !loading && (
              <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>
            )}
            <div className={styles.langToggle}>
              <button
                className={`${styles.langBtn} ${lang === 'DE' ? styles.langActive : ''}`}
                onClick={() => switchLang('DE')}
              >DE</button>
              <button
                className={`${styles.langBtn} ${lang === 'EN' ? styles.langActive : ''}`}
                onClick={() => switchLang('EN')}
              >EN</button>
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className={styles.progressTrack}>
          {t.steps.map((_, i) => {
            const hasResult = [true, !!results.step1, !!results.step2, !!results.step3, !!results.step4][i]
            const clickable = hasResult && i !== step && !loading
            return (
              <div
                key={i}
                className={`${styles.progStep} ${i < step ? styles.done : i === step ? styles.active : ''} ${clickable ? styles.progStepClickable : ''}`}
                style={i === step ? { background: STEP_COLORS[step] || 'var(--accent)' } : undefined}
                onClick={() => clickable && goToStep(i)}
              />
            )
          })}
        </div>
        <div className={styles.progLabels}>
          {t.steps.map((label, i) => {
            const hasResult = [true, !!results.step1, !!results.step2, !!results.step3, !!results.step4][i]
            const clickable = hasResult && i !== step && !loading
            return (
              <div
                key={i}
                className={`${styles.progLabel} ${i === step ? styles.progLabelActive : ''} ${clickable ? styles.progLabelClickable : ''}`}
                style={i === step ? { color: STEP_COLORS[step] || 'var(--accent)' } : undefined}
                onClick={() => clickable && goToStep(i)}
              >
                {label}
              </div>
            )
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner}>
            ⚠ {error}
            <button onClick={() => setError('')} className={styles.errorClose}>✕</button>
          </div>
        )}

        {/* ── STEP 0: Upload ── */}
        {step === 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={`${styles.pill} ${styles.pillUpload}`}>↑</span>
              {t.cardTitle}
            </div>
            <div className={styles.divider} />

            {/* FIX #3: JD is paste-only — no upload zone */}
            <div className={styles.uploadSection}>
              <div className={styles.uploadLabel}>{t.jdLabel}</div>
              <textarea
                className={styles.textarea}
                rows={6}
                {...{placeholder: t.jdPlaceholder}}
                value={jdText}
                onChange={e => setJdText(e.target.value)}
              />
            </div>

            {/* CV: upload (with proper PDF parsing) OR paste */}
            <div className={styles.uploadSection} style={{marginTop: '28px'}}>
              <div className={styles.uploadLabel}>{t.cvLabel}</div>
              <div
                className={`${styles.uploadZone} ${cvDrag ? styles.dragover : ''} ${cvParsing ? styles.parsing : ''}`}
                onDragOver={e => { e.preventDefault(); setCvDrag(true) }}
                onDragLeave={() => setCvDrag(false)}
                onDrop={e => { e.preventDefault(); setCvDrag(false); const f = e.dataTransfer.files[0]; if(f) handleCvFile(f) }}
                onClick={() => !cvParsing && document.getElementById('cvFile')?.click()}
              >
                <input id="cvFile" type="file" accept=".txt,.pdf,.docx,.doc" style={{display:'none'}}
                  onChange={e => { const f = e.target.files?.[0]; if(f) handleCvFile(f) }} />
                {cvParsing ? (
                  <>
                    <div className={styles.uploadIcon}>⏳</div>
                    <div className={styles.uploadHint}>{t.extracting}</div>
                  </>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>📋</div>
                    <div className={styles.uploadHint}><strong>{t.uploadHint}</strong> {t.uploadDrag}</div>
                    <div className={styles.uploadSub}>{t.uploadSub}</div>
                  </>
                )}
                {cvFileName && !cvParsing && <div className={styles.fileName}>✓ {cvFileName}</div>}
              </div>
              <div className={styles.orDivider}><span>{t.orPaste}</span></div>
              <textarea
                className={styles.textarea}
                rows={8}
                {...{placeholder: t.cvPlaceholder}}
                value={cvText}
                onChange={e => setCvText(e.target.value)}
              />
            </div>

            <div className={styles.btnRow}>
              <button className={results.step1 ? styles.btnGhost : styles.btnPrimary} onClick={runStep1}
                disabled={!jdText.trim() || !cvText.trim() || cvParsing}>
                {cvParsing ? t.extracting : t.analyse}
              </button>
            </div>

            <div className={styles.notice}>
              <strong>Tip:</strong> {t.tip}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className={`${styles.card} ${styles.loadingCard}`}>
            <div className={styles.loadingNum} style={{color: STEP_COLORS[step]}}>
              {['①','①','②','③','④'][step]}
            </div>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarInner}
                style={{background: `linear-gradient(90deg, var(--accent2), ${STEP_COLORS[step]})`}} />
            </div>
            <div className={styles.loadingText}>
              {step===1 && t.loadingStep1}
              {step===2 && t.loadingStep2}
              {step===3 && t.loadingStep3}
              {step===4 && t.loadingStep4}
            </div>
          </div>
        )}

        {/* ── STEP 1 RESULT ── */}
        {step === 1 && !loading && results.step1 && (
          <div className={styles.card}>
            <div className={styles.resultHeader}>
              <div className={styles.cardTitle} style={{marginBottom:0}}>
                <span className={`${styles.pill}`} style={{background:'var(--step1)',color:'#0a0a0f'}}>1</span>
                {t.step1Title}
              </div>
              <button className={`${styles.copyBtn} ${copied==='s1'?styles.copied:''}`}
                onClick={() => copyText(results.step1,'s1')}>
                {copied==='s1' ? t.copied : t.copy}
              </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.resultContent}>{fmt(results.step1)}</div>
            <div className={styles.btnRow}>
              <button className={results.step2 ? styles.btnGhost : styles.btnPrimary} onClick={runStep2}>{t.nextFit}</button>
              <button className={styles.btnGhost} onClick={() => setStep(0)}>{t.back}</button>
            </div>
          </div>
        )}

        {/* ── STEP 2 RESULT ── */}
        {step === 2 && !loading && results.step2 && (() => {
          const verdict = getVerdict(results.step2)
          const vClass = verdict === 'Strong Fit' ? styles.verdictGood : verdict === 'Weak Fit' ? styles.verdictBad : styles.verdictMid
          const vEmoji = verdict === 'Strong Fit' ? '✓' : verdict === 'Weak Fit' ? '✗' : '~'
          return (
            <div className={styles.card}>
              <div className={styles.resultHeader}>
                <div className={styles.cardTitle} style={{marginBottom:0}}>
                  <span className={styles.pill} style={{background:'var(--step2)',color:'#0a0a0f'}}>2</span>
                  {t.step2Title}
                </div>
                <button className={`${styles.copyBtn} ${copied==='s2'?styles.copied:''}`}
                  onClick={() => copyText(results.step2,'s2')}>
                  {copied==='s2' ? t.copied : t.copy}
                </button>
              </div>
              <div className={styles.divider} />
              {verdict && <div className={`${styles.verdictBlock} ${vClass}`}>{vEmoji} {verdict}</div>}
              <div className={styles.resultContent}>{fmt(results.step2)}</div>
              <div className={styles.btnRow}>
                <button className={results.step3 ? styles.btnGhost : styles.btnPrimary} onClick={runStep3}>{t.nextCV}</button>
                <button className={styles.btnGhost} onClick={() => setStep(1)}>{t.back}</button>
              </div>
            </div>
          )
        })()}

        {/* ── STEP 3 RESULT ── */}
        {step === 3 && !loading && results.step3 && (
          <div className={styles.card}>
            <div className={styles.resultHeader}>
              <div className={styles.cardTitle} style={{marginBottom:0}}>
                <span className={styles.pill} style={{background:'var(--step3)',color:'#fff'}}>3</span>
                {t.step3Title}
              </div>
              <button className={`${styles.copyBtn} ${copied==='s3'?styles.copied:''}`}
                onClick={() => copyText(cvTab==='rewritten'?results.step3:cvText,'s3')}>
                {copied==='s3' ? t.copied : t.copy}
              </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${cvTab==='rewritten'?styles.tabActive:''}`}
                onClick={() => setCvTab('rewritten')}>{t.tabRewritten}</button>
              <button className={`${styles.tab} ${cvTab==='original'?styles.tabActive:''}`}
                onClick={() => setCvTab('original')}>{t.tabOriginal}</button>
            </div>
            <div className={styles.resultContent}>
              {fmt(cvTab === 'rewritten' ? results.step3 : cvText)}
            </div>
            <div className={styles.btnRow}>
              <button className={results.step4 ? styles.btnGhost : styles.btnPrimary} onClick={() => runStep4(results.step3)}>{t.nextCover}</button>
              <button className={styles.btnGhost} onClick={() => setStep(2)}>{t.back}</button>
            </div>
          </div>
        )}

        {/* ── STEP 4 RESULT ── */}
        {step === 4 && !loading && results.step4 && (
          <>
            <div className={styles.card}>
              <div className={styles.resultHeader}>
                <div className={styles.cardTitle} style={{marginBottom:0}}>
                  <span className={styles.pill} style={{background:'var(--step4)',color:'#0a0a0f'}}>4</span>
                  {t.step4Title}
                </div>
                <button className={`${styles.copyBtn} ${copied==='s4'?styles.copied:''}`}
                  onClick={() => copyText(results.step4,'s4')}>
                  {copied==='s4' ? t.copied : t.copy}
                </button>
              </div>
              <div className={styles.divider} />
              <div className={styles.resultContent}>{fmt(results.step4)}</div>
              <div className={styles.btnRow}>
                <button className={styles.btnGhost} onClick={() => setStep(3)}>{t.back}</button>
              </div>
            </div>

            <div className={styles.finalBar}>
              <h2>{t.doneTitle}</h2>
              <p>{t.doneText}</p>
              <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>
            </div>
          </>
        )}
        {/* Footer */}
        <footer className={styles.footer}>
          © {new Date().getFullYear()} BewerbAI · {t.footer}
        </footer>
      </div>
    </div>
  )
}
