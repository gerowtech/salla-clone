'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('ali@abcstore.com');
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingToken, setPendingToken] = useState('');
  const [companies, setCompanies] = useState<Array<{id:string;name:string;role?:string;position?:string}>>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMessage(''); setBusy(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Login failed');
      if (!Array.isArray(d.companies) || d.companies.length === 0) throw new Error('No active company is linked to this account. Contact your administrator.');
      if (d.companies.length > 1) { setPendingToken(d.accessToken); setCompanies(d.companies); setSelectedCompany(d.activeCompanyId || d.companies[0].id); return; }
      saveSession(d);
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Unable to login'); }
    finally { setBusy(false); }
  }
  function saveSession(d: any) {
    localStorage.setItem('salepro_access_token', d.accessToken);
    localStorage.setItem('salepro_company_id', d.activeCompanyId);
    localStorage.setItem('salepro_user', JSON.stringify(d.user));
    localStorage.setItem('salepro_companies', JSON.stringify(d.companies || []));
    localStorage.setItem('salepro_permissions', JSON.stringify(d.permissions || []));
    location.href = '/dashboard';
  }
  async function confirmCompany() {
    if (!selectedCompany || !pendingToken) return;
    setBusy(true); setMessage('');
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'}/auth/select-company`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pendingToken}` }, body: JSON.stringify({ companyId: selectedCompany }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Unable to select company');
      saveSession(d);
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Unable to select company'); }
    finally { setBusy(false); }
  }
  return <main className="auth-screen">
    <section className="auth-art"><div className="erp-brand" style={{ color: '#fff', padding: 0 }}><span className="brand-mark">S</span><span>Sale<span className="brand-pro">Pro</span></span></div><h1>Run your business from one place.</h1><p>Sales, inventory, purchasing, finance and teams — connected in one clear workspace built to help you make confident decisions.</p><div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 22, color: '#dceaff', fontSize: 12 }}><ShieldCheck size={17}/> Secure multi-company business workspace</div></section>
    <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><div style={{ color: '#2878f0', fontWeight: 800, fontSize: 23, marginBottom: 25 }}>Sale<span style={{ color: '#ff925f' }}>Pro</span></div><h2>{pendingToken ? 'Choose your company' : 'Welcome back'}</h2><p className="muted">{pendingToken ? 'Select the company workspace you want to open.' : 'Sign in to continue to your workspace.'}</p>{pendingToken ? <><label htmlFor="company">Company workspace</label><select id="company" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} style={{ width: '100%', padding: '13px 14px', border: '1px solid #dce4f0', borderRadius: 9, marginBottom: 18, background: '#fff' }}>{companies.map(c => <option key={c.id} value={c.id}>{c.name} — {c.position || c.role || 'User'}</option>)}</select><button type="button" className="button" disabled={busy || !selectedCompany} onClick={confirmCompany}>{busy ? 'Opening workspace…' : <>Continue <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }}/></>}</button>{message && <p role="alert" style={{ color: '#c43d50', fontSize: 12, marginTop: 14 }}>{message}</p>}<button type="button" onClick={() => { setPendingToken(''); setCompanies([]); setMessage(''); }} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 0, color: '#2878f0', cursor: 'pointer' }}>Back to sign in</button></> : <><label htmlFor="email">Email address</label><input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="username" required/><label htmlFor="password">Password</label><input id="password" value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" required/><button className="button" disabled={busy}>{busy ? 'Signing in…' : <>Sign in <ArrowRight size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }}/></>}</button>{message && <p role="alert" style={{ color: '#c43d50', fontSize: 12, marginTop: 14 }}>{message}</p>}<p className="muted" style={{ fontSize: 11, marginTop: 22 }}>Need an account? <Link href="/" style={{ color: '#2878f0', fontWeight: 700 }}>Contact your administrator</Link></p></>}</form></section>
  </main>;
}
