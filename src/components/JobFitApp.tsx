'use client'

import { useState, useRef } from 'react'
import styles from './JobFitApp.module.css'

type Step = 0 | 1 | 2 | 3
type Mode = 'all' | 'analysis' | 'cv' | 'cover'
type Results = { step1: string; step2: string; step3: string }

const STEP_COLORS = ['', 'var(--step1)', 'var(--step3)', 'var(--step4)']

const T = {
  EN: {
    tagline: 'Craft. Tailor. Apply.',
    newApp: '↺ New Application',
    steps: ['Upload', 'Analysis & Fit', 'CV Rewrite', 'Cover Letter'],
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
    analyseCV: 'Rewrite CV →',
    analyseCover: 'Write Cover Letter →',
    tip: 'For best results with complex layouts, paste your CV text directly. Your documents are not stored.',
    back: '← Back',
    nextCV: 'Next: Rewrite CV →',
    nextCover: 'Next: Cover Letter →',
    step1Title: 'Analysis & Fit Review',
    step2Title: 'Optimised CV',
    step3Title: 'Cover Letter',
    tabRewritten: 'Rewritten',
    tabOriginal: 'Original',
    translating: 'Translating to German...',
    loadingStep1: 'Analysing job & checking your fit...',
    loadingStep2: 'Rewriting and optimising your CV...',
    loadingStep3: 'Writing your cover letter...',
    doneTitle: "You're application-ready ✦",
    doneText: 'All steps are complete. Copy what you need above to complete your current application. Or start fresh with a new job :)',
    copy: '⎘ Copy',
    copied: '✓ Copied!',
    footer: 'All rights reserved · Zahir Hussain',
    errJD: 'Please provide a job description.',
    errCV: 'Please provide your CV.',
    modeLabel: 'What do you need?',
    modeAll: 'Complete Application',
    modeAllSub: 'Analysis + CV Rewrite + Cover Letter',
    modeAnalysis: 'Analysis & Fit Only',
    modeAnalysisSub: 'Understand the JD & Check your fit',
    modeCv: 'CV Rewrite Only',
    modeCvSub: 'Optimise your CV for this role',
    modeCover: 'Cover Letter Only',
    modeCoverSub: 'Write a tailored cover letter',
    addCoverLetter: '+ Also get Cover Letter →',
    addCvAndCover: '+ Also get CV Rewrite + Cover Letter →',
  },
  DE: {
    tagline: 'Erstellen. Anpassen. Bewerben.',
    newApp: '↺ Neue Bewerbung',
    steps: ['Upload', 'Analyse & Passung', 'Lebenslauf', 'Anschreiben'],
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
    analyseCV: 'Lebenslauf umschreiben →',
    analyseCover: 'Anschreiben verfassen →',
    tip: 'Für beste Ergebnisse den Text direkt einfügen. Ihre Dokumente werden nicht gespeichert.',
    back: '← Zurück',
    nextCV: 'Weiter: Lebenslauf →',
    nextCover: 'Weiter: Anschreiben →',
    step1Title: 'Analyse & Passgenauigkeit',
    step2Title: 'Optimierter Lebenslauf',
    step3Title: 'Anschreiben',
    tabRewritten: 'Überarbeitet',
    tabOriginal: 'Original',
    translating: 'Wird ins Deutsche übersetzt...',
    loadingStep1: 'Stelle & Passung werden analysiert...',
    loadingStep2: 'Lebenslauf wird optimiert...',
    loadingStep3: 'Anschreiben wird verfasst...',
    doneTitle: 'Ihre Bewerbung ist fertig ✦',
    doneText: 'Alle Schritte abgeschlossen. Kopieren Sie was Sie benötigen oder starten Sie eine neue Bewerbung :)',
    copy: '⎘ Kopieren',
    copied: '✓ Kopiert!',
    footer: 'Alle Rechte vorbehalten · Zahir Hussain',
    errJD: 'Bitte geben Sie eine Stellenbeschreibung an.',
    errCV: 'Bitte geben Sie Ihren Lebenslauf an.',
    addCoverLetter: '+ Auch ein Anschreiben →',
    addCvAndCover: '+ Auch Lebenslauf + Anschreiben →',
    modeLabel: 'Was benötigen Sie?',
    modeAll: 'Komplette Bewerbung',
    modeAllSub: 'Analyse + Lebenslauf + Anschreiben',
    modeAnalysis: 'Nur Analyse & Passung',
    modeAnalysisSub: 'Stelle verstehen & Passung prüfen',
    modeCv: 'Nur Lebenslauf',
    modeCvSub: 'Lebenslauf für diese Stelle optimieren',
    modeCover: 'Nur Anschreiben',
    modeCoverSub: 'Maßgeschneidertes Anschreiben verfassen',
  }
}

export default function JobFitApp() {
  const [step, setStep] = useState<Step>(0)
  const [mode, setMode] = useState<Mode>('all')
  const [jdText, setJdText] = useState('')
  const [cvText, setCvText] = useState('')
  const [cvFileName, setCvFileName] = useState('')
  const [cvParsing, setCvParsing] = useState(false)
  const [results, setResults] = useState<Results>({ step1: '', step2: '', step3: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cvTab, setCvTab] = useState<'rewritten' | 'original'>('rewritten')
  const [copied, setCopied] = useState<string | null>(null)
  const [cvDrag, setCvDrag] = useState(false)
  const [lang, setLang] = useState<'EN' | 'DE'>('EN')
  const t = T[lang]

  const switchLang = async (newLang: 'EN' | 'DE') => {
    if (newLang === lang) return
    setLang(newLang)
    langRef.current = newLang  // update ref immediately so callApi uses new lang

    // If we're on the upload page, nothing to re-run
    if (step === 0) return

    // Re-run only the current step in the new language, keep other results
    setLoading(true)
    setError('')
    try {
      if (step === 1) {
        const r = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'step1combined', jdText: jdRef.current, cvText: cvRef.current, lang: newLang })
        })
        const d = await r.json(); if (!r.ok) throw new Error(d.error)
        setResults(p => ({ ...p, step1: d.result }))
      } else if (step === 2) {
        const r = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'step3', jdText: jdRef.current, cvText: cvRef.current, lang: newLang })
        })
        const d = await r.json(); if (!r.ok) throw new Error(d.error)
        setResults(p => ({ ...p, step2: d.result }))
      } else if (step === 3) {
        const rewrittenCv = results.step2 || cvRef.current
        const r = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'step4', jdText: jdRef.current, cvText: cvRef.current, lang: newLang, rewrittenCv })
        })
        const d = await r.json(); if (!r.ok) throw new Error(d.error)
        setResults(p => ({ ...p, step3: d.result }))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Translation failed')
    } finally {
      setLoading(false)
    }
  }

  const jdRef = useRef(jdText)
  const cvRef = useRef(cvText)
  const langRef = useRef(lang)
  jdRef.current = jdText
  cvRef.current = cvText
  langRef.current = lang

  const callApi = async (stepKey: string, extra?: { rewrittenCv?: string }) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey, jdText: jdRef.current, cvText: cvRef.current, lang: langRef.current, ...extra })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      return data.result as string
    } finally {
      setLoading(false)
    }
  }

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
      interface TextItem { str: string; transform: number[] }
      const items = content.items as TextItem[]
      const sorted = [...items].sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5]
        if (Math.abs(yDiff) > 3) return yDiff
        return a.transform[4] - b.transform[4]
      })
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
      for (const group of lineGroups) {
        const line = group.map(item => item.str.trim()).filter(Boolean).join(' ')
        if (line) allLines.push(line)
      }
      if (i < pdf.numPages) allLines.push('')
    }
    return allLines.join('\n')
  }

  const handleCvFile = async (file: File) => {
    setCvParsing(true); setCvFileName(file.name); setCvText('')
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
      if (!text.trim()) { setCvFileName(''); alert('Could not extract text. Please paste directly.'); return }
      setCvText(text); cvRef.current = text
    } catch (e) { setCvFileName(''); alert('Could not read file. Please paste your CV text directly.'); console.error(e)
    } finally { setCvParsing(false) }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000) })
  }

  const runStep1 = async () => {
    setStep(1); if (results.step1) return
    try { const r = await callApi('step1combined'); setResults(p => ({ ...p, step1: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(0) }
  }

  const runStep2 = async () => {
    setStep(2); if (results.step2) return
    try { const r = await callApi('step3'); setResults(p => ({ ...p, step2: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(mode === 'all' ? 1 : 0) }
  }

  const runStep3 = async (rewrittenCv?: string) => {
    setStep(3); if (results.step3) return
    try { const r = await callApi('step4', { rewrittenCv: rewrittenCv || cvRef.current }); setResults(p => ({ ...p, step3: r }))
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Unknown error'); setStep(mode === 'all' ? 2 : 0) }
  }

  const handleAnalyse = async () => {
    if (!jdRef.current.trim()) { setError(t.errJD); return }
    if (!cvRef.current.trim()) { setError(t.errCV); return }
    if (mode === 'analysis') { await runStep1(); return }
    if (mode === 'cv') { await runStep2(); return }
    if (mode === 'cover') { await runStep3(); return }
    await runStep1()
  }

  const reset = () => {
    setStep(0); setJdText(''); setCvText(''); setCvFileName('')
    jdRef.current = ''; cvRef.current = ''
    setResults({ step1: '', step2: '', step3: '' }); setError(''); setMode('all')
  }

  const fmt = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4)
        return <div key={i} className={styles.heading}>{line.slice(2,-2)}</div>
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      const rendered = parts.map((p,j) => p.startsWith('**') && p.endsWith('**')
        ? <strong key={j} className={styles.bold}>{p.slice(2,-2)}</strong> : p)
      if (line.startsWith('- ') || line.startsWith('• '))
        return <div key={i} className={styles.bullet}><span className={styles.bulletDot}>›</span><span>{rendered}</span></div>
      if (line === '') return <div key={i} className={styles.spacer} />
      return <div key={i} className={styles.line}>{rendered}</div>
    })
  }

  const getVerdict = (text: string) => {
    const m = text.match(/Overall Verdict:\*?\*?\s*(Strong Fit|Partial Fit|Weak Fit|Starke Passung|Teilweise Passend|Schwache Passung)/i)
    return m ? m[1] : ''
  }

  const pSteps = mode === 'analysis' ? [t.steps[0], t.steps[1]]
    : mode === 'cv' ? [t.steps[0], t.steps[2]]
    : mode === 'cover' ? [t.steps[0], t.steps[3]]
    : t.steps
  const pCurrent = mode === 'all' ? step : (step === 0 ? 0 : 1)

  return (
    <div className={styles.root}>
      <div className={styles.bgMesh} />
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <div className={styles.logo}>Bewerb<span>AI</span></div>
            <div className={styles.tagline}>{t.tagline}</div>
          </div>
          <div className={styles.headerRight}>
            {step > 0 && !loading && <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>}
            <div className={styles.langToggle}>
              <button className={`${styles.langBtn} ${lang==='DE'?styles.langActive:''}`} onClick={() => switchLang('DE')}>DE</button>
              <button className={`${styles.langBtn} ${lang==='EN'?styles.langActive:''}`} onClick={() => switchLang('EN')}>EN</button>
            </div>
          </div>
        </header>

        <div className={styles.progressTrack}>
          {pSteps.map((_, i) => (
            <div key={i}
              className={`${styles.progStep} ${i<pCurrent?styles.done:i===pCurrent?styles.active:''} ${i<pCurrent&&!loading?styles.progStepClickable:''}`}
              style={i===pCurrent?{background:STEP_COLORS[step]||'var(--accent)'}:undefined}
              onClick={() => { if(i<pCurrent&&!loading) setStep(0) }} />
          ))}
        </div>
        <div className={styles.progLabels}>
          {pSteps.map((label, i) => (
            <div key={i}
              className={`${styles.progLabel} ${i===pCurrent?styles.progLabelActive:''} ${i<pCurrent&&!loading?styles.progLabelClickable:''}`}
              style={i===pCurrent?{color:STEP_COLORS[step]||'var(--accent)'}:undefined}
              onClick={() => { if(i<pCurrent&&!loading) setStep(0) }}
            >{label}</div>
          ))}
        </div>

        {error && (
          <div className={styles.errorBanner}>⚠ {error}
            <button onClick={() => setError('')} className={styles.errorClose}>✕</button>
          </div>
        )}

        {step === 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={`${styles.pill} ${styles.pillUpload}`}>↑</span>{t.cardTitle}
            </div>
            <div className={styles.divider} />
            <div className={styles.uploadSection}>
              <div className={styles.uploadLabel}>{t.jdLabel}</div>
              <textarea className={styles.textarea} rows={6} placeholder={t.jdPlaceholder} value={jdText} onChange={e => setJdText(e.target.value)} />
            </div>
            <div className={styles.uploadSection} style={{marginTop:'24px'}}>
              <div className={styles.uploadLabel}>{t.cvLabel}</div>
              <div className={`${styles.uploadZone} ${cvDrag?styles.dragover:''} ${cvParsing?styles.parsing:''}`}
                onDragOver={e=>{e.preventDefault();setCvDrag(true)}} onDragLeave={()=>setCvDrag(false)}
                onDrop={e=>{e.preventDefault();setCvDrag(false);const f=e.dataTransfer.files[0];if(f)handleCvFile(f)}}
                onClick={()=>!cvParsing&&document.getElementById('cvFile')?.click()}>
                <input id="cvFile" type="file" accept=".txt,.pdf,.docx,.doc" style={{display:'none'}}
                  onChange={e=>{const f=e.target.files?.[0];if(f)handleCvFile(f)}} />
                {cvParsing
                  ? <><div className={styles.uploadIcon}>⏳</div><div className={styles.uploadHint}>{t.extracting}</div></>
                  : <><div className={styles.uploadIcon}>📋</div>
                    <div className={styles.uploadHint}><strong>{t.uploadHint}</strong> {t.uploadDrag}</div>
                    <div className={styles.uploadSub}>{t.uploadSub}</div></>}
                {cvFileName&&!cvParsing&&<div className={styles.fileName}>✓ {cvFileName}</div>}
              </div>
              <div className={styles.orDivider}><span>{t.orPaste}</span></div>
              <textarea className={styles.textarea} rows={7} placeholder={t.cvPlaceholder} value={cvText} onChange={e => setCvText(e.target.value)} />
            </div>

            <div className={styles.modeSection}>
              <div className={styles.modeLabel}>{t.modeLabel}</div>
              <div className={styles.modeGrid}>
                {([
                  {key:'all' as Mode, icon:'', label:t.modeAll, sub:t.modeAllSub},
                  {key:'analysis' as Mode, icon:'', label:t.modeAnalysis, sub:t.modeAnalysisSub},
                  {key:'cv' as Mode, icon:'', label:t.modeCv, sub:t.modeCvSub},
                  {key:'cover' as Mode, icon:'', label:t.modeCover, sub:t.modeCoverSub},
                ]).map(m => (
                  <div key={m.key} className={`${styles.modeCard} ${mode===m.key?styles.modeCardActive:''}`} onClick={()=>setMode(m.key)}>
                    
                    <span className={styles.modeName}>{m.label}</span>
                    <span className={styles.modeSub}>{m.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.btnRow}>
              <button className={styles.btnPrimary} onClick={handleAnalyse} disabled={!jdText.trim()||!cvText.trim()||cvParsing}>
                {cvParsing ? t.extracting : mode === 'cv' ? t.analyseCV : mode === 'cover' ? t.analyseCover : t.analyse}
              </button>
            </div>
            <div className={styles.notice}><strong>Tip:</strong> {t.tip}</div>
          </div>
        )}

        {loading && (
          <div className={`${styles.card} ${styles.loadingCard}`}>
            <div className={styles.loadingNum} style={{color:STEP_COLORS[step]}}>
              {step===1?'①':step===2?'②':'③'}
            </div>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarInner} style={{background:`linear-gradient(90deg,var(--accent2),${STEP_COLORS[step]})`}} />
            </div>
            <div className={styles.loadingText}>
              {step===1&&t.loadingStep1}{step===2&&t.loadingStep2}{step===3&&t.loadingStep3}
            </div>
          </div>
        )}

        {step===1&&!loading&&results.step1&&(()=>{
          const verdict=getVerdict(results.step1)
          const vClass=/strong|stark/i.test(verdict)?styles.verdictGood:/weak|schwach/i.test(verdict)?styles.verdictBad:styles.verdictMid
          const vEmoji=/strong|stark/i.test(verdict)?'✓':/weak|schwach/i.test(verdict)?'✗':'~'
          return (
            <div className={styles.card}>
              <div className={styles.resultHeader}>
                <div className={styles.cardTitle} style={{marginBottom:0}}>
                  <span className={styles.pill} style={{background:'var(--step1)',color:'#0a0a0f'}}>1</span>{t.step1Title}
                </div>
                <button className={`${styles.copyBtn} ${copied==='s1'?styles.copied:''}`} onClick={()=>copyText(results.step1,'s1')}>
                  {copied==='s1'?t.copied:t.copy}
                </button>
              </div>
              <div className={styles.divider} />
              {verdict&&<div className={`${styles.verdictBlock} ${vClass}`}>{vEmoji} {verdict}</div>}
              <div className={styles.resultContent}>{fmt(results.step1)}</div>
              <div className={styles.btnRow}>
                {mode==='all'&&<button className={results.step2?styles.btnGhost:styles.btnPrimary} onClick={runStep2}>{t.nextCV}</button>}
                <button className={styles.btnGhost} onClick={()=>setStep(0)}>{t.back}</button>
              </div>
            </div>
          )
        })()}

        {step===2&&!loading&&results.step2&&(
          <div className={styles.card}>
            <div className={styles.resultHeader}>
              <div className={styles.cardTitle} style={{marginBottom:0}}>
                <span className={styles.pill} style={{background:'var(--step3)',color:'#fff'}}>2</span>{t.step2Title}
              </div>
              <button className={`${styles.copyBtn} ${copied==='s2'?styles.copied:''}`} onClick={()=>copyText(cvTab==='rewritten'?results.step2:cvText,'s2')}>
                {copied==='s2'?t.copied:t.copy}
              </button>
            </div>
            <div className={styles.divider} />
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${cvTab==='rewritten'?styles.tabActive:''}`} onClick={()=>setCvTab('rewritten')}>{t.tabRewritten}</button>
              <button className={`${styles.tab} ${cvTab==='original'?styles.tabActive:''}`} onClick={()=>setCvTab('original')}>{t.tabOriginal}</button>
            </div>
            <div className={styles.resultContent}>{fmt(cvTab==='rewritten'?results.step2:cvText)}</div>
            <div className={styles.btnRow}>
              {mode==='all'&&<button className={results.step3?styles.btnGhost:styles.btnPrimary} onClick={()=>runStep3(results.step2)}>{t.nextCover}</button>}
              <button className={styles.btnGhost} onClick={()=>setStep(mode==='all'?1:0)}>{t.back}</button>
            </div>
          </div>
        )}

        {step===3&&!loading&&results.step3&&(
          <>
            <div className={styles.card}>
              <div className={styles.resultHeader}>
                <div className={styles.cardTitle} style={{marginBottom:0}}>
                  <span className={styles.pill} style={{background:'var(--step4)',color:'#0a0a0f'}}>3</span>{t.step3Title}
                </div>
                <button className={`${styles.copyBtn} ${copied==='s3'?styles.copied:''}`} onClick={()=>copyText(results.step3,'s3')}>
                  {copied==='s3'?t.copied:t.copy}
                </button>
              </div>
              <div className={styles.divider} />
              <div className={styles.resultContent}>{fmt(results.step3)}</div>
              <div className={styles.btnRow}>
                <button className={styles.btnGhost} onClick={()=>setStep(mode==='all'?2:0)}>{t.back}</button>
              </div>
            </div>
            <div className={styles.finalBar}>
              <h2>{t.doneTitle}</h2><p>{t.doneText}</p>
              <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>
            </div>
          </>
        )}

        {!loading&&step===1&&mode==='analysis'&&results.step1&&(
          <div className={styles.finalBar}>
            <h2>{t.doneTitle}</h2><p>{t.doneText}</p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
              <button className={styles.btnPrimary} style={{fontSize:'0.85rem',padding:'10px 20px'}}
                onClick={()=>{ setMode('all'); runStep2() }}>
                {t.addCvAndCover}
              </button>
              <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>
            </div>
          </div>
        )}
        {!loading&&step===2&&mode==='cv'&&results.step2&&(
          <div className={styles.finalBar}>
            <h2>{t.doneTitle}</h2><p>{t.doneText}</p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'}}>
              <button className={styles.btnPrimary} style={{fontSize:'0.85rem',padding:'10px 20px'}}
                onClick={()=>{ setMode('cover'); runStep3(results.step2) }}>
                {t.addCoverLetter}
              </button>
              <button className={styles.resetBtn} onClick={reset}>{t.newApp}</button>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          © {new Date().getFullYear()} BewerbAI · {t.footer}
        </footer>
      </div>
    </div>
  )
}
