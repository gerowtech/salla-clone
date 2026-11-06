'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Boxes, Building2, CalendarDays, ChevronDown, FileText, Globe2, Maximize2, ShoppingBag, Search, Settings, Sun, UserRound } from 'lucide-react';
import {LANGUAGES, useLanguage} from '@/i18n/LanguageProvider';

type UserProfile = { id?: string; displayName?: string; email?: string; position?: string; role?: string };
type Company = { id: string; name: string; countryCode?: string };
type Warehouse = { id: string; name: string; code: string; branch?: { name: string } | null };

export default function Header() {
  const router = useRouter();
  const {code,setCode,t} = useLanguage();
  const profileRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState('Demo Company');
  const [companyId, setCompanyId] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('salepro_user');
      if (raw) setProfile(JSON.parse(raw));
      const activeId = localStorage.getItem('salepro_company_id') || '';
      setCompanyId(activeId);
      const saved = localStorage.getItem('salepro_companies');
      if (saved) {
        const parsed = JSON.parse(saved) as Company[];
        const active = parsed.find(item => item.id === activeId) || parsed[0];
        if (active) { setCompany(active.name); setCompanyId(active.id); }
      }
      setSelectedWarehouseId(localStorage.getItem('salepro_warehouse_id') || '');
    } catch { /* Keep safe defaults when local storage is unavailable. */ }
  }, []);

  useEffect(() => {
    if (!companyId || !profile?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
        const token = localStorage.getItem('salepro_access_token');
        const response = await fetch(`${api}/warehouses`, { headers: { 'x-company-id': companyId, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setWarehouses(Array.isArray(data) ? data : []);
      } catch { if (!cancelled) setWarehouses([]); }
    };
    load();
    return () => { cancelled = true; };
  }, [companyId, profile?.id]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) setLanguageOpen(false);
      if (!(event.target as HTMLElement).closest('.company-picker-wrap')) setWarehouseOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setProfileOpen(false); setWarehouseOpen(false); setLanguageOpen(false); } };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);

  const displayName = profile?.displayName || profile?.email || 'Admin';
  const selectedWarehouse = warehouses.find(item => item.id === selectedWarehouseId);
  const logout = () => {
    ['salepro_access_token', 'salepro_refresh_token', 'salepro_user', 'salepro_company_id', 'salepro_warehouse_id'].forEach(key => localStorage.removeItem(key));
    router.replace('/login');
  };

  return (
    <header className="erp-topbar reference-topbar">
      <button className="icon-button mobile-menu" aria-label="Open navigation">☰</button>
      <label className="global-search" aria-label="Search Salla"><Search size={18}/><input type="search" placeholder={t("Search")+" anything (products, customers, invoices...)"}/><kbd>Ctrl K</kbd></label>
      <div className="top-actions">
        <div className="company-picker-wrap">
          <button type="button" className="company-picker" aria-expanded={warehouseOpen} onClick={() => setWarehouseOpen(value => !value)}>
            <Building2 size={20}/><span><strong>{selectedWarehouse?.name || company}</strong><small>{selectedWarehouse?.branch?.name || 'Company workspace'}</small></span><ChevronDown size={14}/>
          </button>
          {warehouseOpen && <div className="warehouse-picker-menu">
            <div className="warehouse-picker-title">{company} · Warehouses</div>
            <button type="button" className={`warehouse-option ${!selectedWarehouseId ? 'active' : ''}`} onClick={() => { setSelectedWarehouseId(''); localStorage.removeItem('salepro_warehouse_id'); setWarehouseOpen(false); }}><Building2 size={15}/><span>{t("All Warehouses")}</span>{!selectedWarehouseId && <b>✓</b>}</button>
            {warehouses.map(item => <button type="button" key={item.id} className={`warehouse-option ${selectedWarehouseId === item.id ? 'active' : ''}`} onClick={() => { setSelectedWarehouseId(item.id); localStorage.setItem('salepro_warehouse_id', item.id); setWarehouseOpen(false); }}><Boxes size={15}/><span><strong>{item.name}</strong><small>{item.branch?.name || item.code}</small></span>{selectedWarehouseId === item.id && <b>✓</b>}</button>)}
            {warehouses.length === 0 && <div className="warehouse-picker-message">No warehouses found for this company.</div>}
          </div>}
        </div>
        <button type="button" className="pos-icon-button" title="Open POS" aria-label="Open POS" onClick={() => router.push('/pos')}><ShoppingBag size={18}/></button>
        <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={19}/><i>5</i></button>
        <button className="icon-button" type="button" aria-label="Full screen" onClick={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }}><Maximize2 size={17}/></button>
        <button className="icon-button" type="button" aria-label="Theme"><Sun size={18}/></button>
        <div className="language-picker-wrap" ref={languageRef}>
          <button type="button" className="language-button" title="Select language" aria-label="Select language" aria-expanded={languageOpen} aria-haspopup="listbox" onClick={() => setLanguageOpen(value => !value)}><Globe2 className="language-globe" size={16}/><span className="language-current">{LANGUAGES.find(lang => lang.code === code)?.name || 'English'}</span><ChevronDown className={`language-chevron ${languageOpen ? 'is-open' : ''}`} size={13}/></button>
          {languageOpen && <div className="language-menu" role="listbox" aria-label="Choose language">{LANGUAGES.map(lang => <button type="button" role="option" aria-selected={code === lang.code} key={lang.code} className={`language-option ${code === lang.code ? 'active' : ''}`} onClick={() => { setCode(lang.code); setLanguageOpen(false); }}>{lang.name}{code === lang.code && <span aria-hidden="true">✓</span>}</button>)}</div>}
        </div>
        <div className="profile-dropdown" ref={profileRef}>
          <button type="button" className="profile-button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-haspopup="menu"><span className="avatar">{displayName.slice(0,1).toUpperCase()}</span><span><strong>{displayName}</strong><small>{profile?.position || profile?.role || 'Administrator'}</small></span><ChevronDown size={14}/></button>
          {profileOpen && <div className="profile-menu" role="menu">
            <div className="profile-menu-header"><strong>{displayName}</strong><small>{profile?.email || 'Email not available'}</small><small>{profile?.role || 'Administrator'}</small></div>
            <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); router.push('/settings'); }}><UserRound size={16}/> My Profile</button>
            <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); router.push('/settings'); }}><Settings size={16}/> Account Settings</button>
            <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); router.push('/reports'); }}><FileText size={16}/> My Transactions</button>
            <button type="button" role="menuitem" onClick={() => setProfileOpen(false)}><CalendarDays size={16}/> My Holiday</button>
            <div className="profile-menu-divider"/><button type="button" role="menuitem" className="logout-menu-item" onClick={logout}>{t("Logout")}</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
