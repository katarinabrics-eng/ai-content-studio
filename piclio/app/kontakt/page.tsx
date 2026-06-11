'use client'

import { useState } from 'react'

export default function KontaktPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, type, message }),
      })
      if (res.ok) {
        setStatus('ok')
        setName(''); setEmail(''); setPhone(''); setType(''); setMessage('')
      } else {
        setStatus('err')
      }
    } catch {
      setStatus('err')
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0a14; color: #fff; font-family: 'Inter', system-ui, sans-serif; }
        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; }
        .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 40px; }
        .logo span { color: #b7e94c; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 40px; width: 100%; max-width: 560px; }
        h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
        .sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 32px; line-height: 1.5; }
        .form-group { margin-bottom: 20px; }
        label { display: block; font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
        input, select, textarea {
          width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; color: #fff; font-size: 15px; padding: 12px 14px;
          outline: none; transition: border-color 0.2s;
          font-family: inherit;
        }
        input:focus, select:focus, textarea:focus { border-color: #b7e94c; }
        select option { background: #1a1225; }
        textarea { resize: vertical; min-height: 120px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px;
          border-radius: 50px; font-size: 15px; font-weight: 700; cursor: pointer;
          border: none; transition: all 0.2s; width: 100%; justify-content: center; }
        .btn-primary { background: #b7e94c; color: #0d0a14; }
        .btn-primary:hover { background: #c8f55a; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .msg-ok { margin-top: 16px; padding: 14px 16px; border-radius: 10px; background: rgba(183,233,76,0.1); border: 1px solid rgba(183,233,76,0.3); color: #b7e94c; font-size: 14px; }
        .msg-err { margin-top: 16px; padding: 14px 16px; border-radius: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #f87171; font-size: 14px; }
        .back { margin-top: 24px; font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; }
        .back a { color: rgba(255,255,255,0.6); text-decoration: none; }
        .back a:hover { color: #b7e94c; }
        @media (max-width: 480px) { .row { grid-template-columns: 1fr; } .card { padding: 28px 20px; } }
      `}</style>
      <div className="page">
        <a href="/" className="logo"><span>Piclio</span></a>
        <div className="card">
          <h1>Napište nám</h1>
          <p className="sub">Odpovídáme osobně do 24 hodin. Žádné automatické e-maily.</p>

          {status === 'ok' ? (
            <div className="msg-ok">✓ Zpráva odeslána! Ozveme se co nejdřív.</div>
          ) : (
            <form onSubmit={submitForm}>
              <div className="row">
                <div className="form-group">
                  <label htmlFor="k-name">Jméno a příjmení *</label>
                  <input id="k-name" type="text" required placeholder="Jan Novák" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="k-email">E-mail *</label>
                  <input id="k-email" type="email" required placeholder="jan@firma.cz" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="row">
                <div className="form-group">
                  <label htmlFor="k-phone">Telefon</label>
                  <input id="k-phone" type="tel" placeholder="+420 600 000 000" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="k-type">Typ poptávky</label>
                  <select id="k-type" value={type} onChange={e => setType(e.target.value)}>
                    <option value="">Vyberte...</option>
                    <option value="event">Poptávka pro event</option>
                    <option value="beta">Beta přístup pro fotografy</option>
                    <option value="other">Jiné</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="k-message">Zpráva *</label>
                <textarea id="k-message" required placeholder="Popište vaši akci — datum, počet hostů, místo konání..." value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              {status === 'err' && (
                <div className="msg-err">✗ Nepodařilo se odeslat. Napište nám přímo na ahoj@piclio.cz</div>
              )}
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Odesílám...' : 'Odeslat poptávku →'}
              </button>
            </form>
          )}
        </div>
        <div className="back">
          <a href="/">← Zpět na Piclio.cz</a>
          &nbsp;·&nbsp;
          <a href="mailto:ahoj@piclio.cz">ahoj@piclio.cz</a>
          &nbsp;·&nbsp;
          <a href="tel:+420604750776">+420 604 750 776</a>
        </div>
      </div>
    </>
  )
}
