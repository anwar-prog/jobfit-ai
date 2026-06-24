'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/')
  }, [session, router])

  if (status === 'loading') {
    return (
      <div style={styles.root}>
        <div style={styles.spinner}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>
          Bewerb<span style={styles.logoAccent}>AI</span>
        </div>
        <div style={styles.tagline}>Craft. Tailor. Apply.</div>

        <div style={styles.divider} />

        <p style={styles.desc}>
          Sign in to craft tailored job applications powered by AI.
        </p>

        <button
          style={styles.googleBtn}
          onClick={() => signIn('google', { callbackUrl: '/' })}
          onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ marginRight: '10px', flexShrink: 0 }}>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
          </svg>
          Sign in with Google
        </button>

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px',
  },
  card: {
    background: '#111118',
    border: '1px solid #2a2a38',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '2rem',
    letterSpacing: '-0.02em',
    color: '#e8e8f0',
    marginBottom: '6px',
  },
  logoAccent: {
    color: '#c8f04a',
  },
  tagline: {
    fontSize: '0.75rem',
    color: '#888899',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '32px',
  },
  divider: {
    height: '1px',
    background: '#2a2a38',
    marginBottom: '28px',
  },
  desc: {
    fontSize: '0.9rem',
    color: '#888899',
    lineHeight: 1.6,
    marginBottom: '28px',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '13px 20px',
    borderRadius: '10px',
    border: 'none',
    background: '#ffffff',
    color: '#1a1a1a',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginBottom: '28px',
  },
  spinner: {
    color: '#888899',
    fontSize: '0.9rem',
  },
}
