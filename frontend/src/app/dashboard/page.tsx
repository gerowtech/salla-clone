'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import {
  Activity, AlertTriangle, BarChart3, Bell, Boxes, Building2, CalendarDays,
  ChevronDown, ChevronRight, ClipboardList, CreditCard, FileText, Globe2,
  Home, Languages, Maximize2, Package, Puzzle, Search, Settings, ShoppingBag,
  ShoppingCart, Store, Users, Wallet, Wrench, Truck, UserRound, CircleDollarSign,
  FolderKanban, Menu, Sun, ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'POS', href: '#pos', icon: ShoppingBag },
  { label: 'Sales', icon: BarChart3, children: ['All Sales', 'Sales Returns', 'Quotations'] },
  { label: 'Purchases', icon: ShoppingCart, children: ['All Purchases', 'Purchase Returns'] },
  { label: 'Products', href: '/products', icon: Package, children: ['All Products', 'Categories', 'Brands', 'Units'] },
  { label: 'Inventory', icon: Boxes, children: ['Warehouses', 'Stock Transfers', 'Stock Adjustments', 'Stock Counts'] },
  { label: 'Customers', href: '#customers', icon: Users },
  { label: 'Suppliers', href: '#suppliers', icon: Truck },
  { label: 'Accounting', icon: CreditCard, children: ['Chart of Accounts', 'Journal Entries', 'Financial Reports'] },
  { label: 'Expenses', href: '#expenses', icon: Wallet },
  { label: 'HRM', icon: UserRound, children: ['Employees', 'Attendance', 'Leave', 'Payroll'] },
  { label: 'CRM', href: '#crm', icon: Activity },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Manufacturing', icon: Wrench, children: ['Production', 'Bill of Materials'] },
  { label: 'E-commerce', icon: Store, children: ['Online Stores', 'Orders', 'Integrations'] },
  { label: 'Reports', href: '#reports', icon: FileText },
  { label: 'Addons', href: '/addons', icon: Puzzle },
  { label: 'Settings', href: '#settings', icon: Settings },
];

const kpis = [
  { label: 'Total Sales', value: 'SAR 245,890', change: '12.5%', icon: BarChart3, tone: 'green' },
  { label: 'Total Purchases', value: 'SAR 120,450', change: '8.2%', icon: ShoppingCart, tone: 'red' },
  { label: 'Net Profit', value: 'SAR 78,320', change: '18.7%', icon: CircleDollarSign, tone: 'blue' },
  { label: 'Total Customers', value: '1,250', change: '5.3%', icon: Users, tone: 'purple' },
  { label: 'Total Products', value: '3,420', change: '2.1%', icon: Package, tone: 'orange' },
  { label: 'Low Stock Items', value: '18', change: '-10.0%', icon: AlertTriangle, tone: 'pink', down: true },
];
const sales = [
  ['INV-2024-001', 'Nov 30, 2024', 'Ali Trading Co.', 'SAR 2,450', 'Paid'],
  ['INV-2024-002', 'Nov 30, 2024', 'Retail Customer', 'SAR 1,230', 'Paid'],
  ['INV-2024-003', 'Nov 29, 2024', 'Abdullah Stores', 'SAR 3,670', 'Pending'],
  ['INV-2024-004', 'Nov 29, 2024', 'Walk-in Customer', 'SAR 980', 'Paid'],
  ['INV-2024-005', 'Nov 28, 2024', 'Global Traders', 'SAR 5,400', 'Paid'],
];
const stock = [
  ['📱', 'iPhone 15', 'Main Warehouse', '45', 'In Stock'],
  ['📺', 'Samsung TV 55”', 'Main Warehouse', '8', 'Low Stock'],
  ['👕', 'T-Shirt (M)', 'Branch 1', '120', 'In Stock'],
  ['🧴', 'Cooking Oil 5L', 'Main Warehouse', '5', 'Low Stock'],
  ['🪑', 'Office Chair', 'Branch 2', '0', 'Out of Stock'],
];

export default function Dashboard() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [profile, setProfile] = useState<{displayName?: string; email?: string; position?: string; role?: string} | null>(null);
  const [company, setCompany] = useState('Demo Company');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<Array<{id:string;name:string;countryCode?:string}>>([]);
  const [warehouseMenuOpen, setWarehouseMenuOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Array<{id:string;name:string;code:string;branch?:{name:string}|null}>>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState('');
  const [period, setPeriod] = useState('Nov 1, 2024 - Nov 30, 2024');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const raw = localStorage.getItem('salepro_user');
    const activeId = localStorage.getItem('salepro_company_id') || '';
    const savedCompanies = localStorage.getItem('salepro_companies');
    if (raw) { try { setProfile(JSON.parse(raw)); } catch { setProfile(null); } }
    setCompanyId(activeId);
    if (savedCompanies) {
      try {
        const parsed = JSON.parse(savedCompanies) as Array<{id:string;name:string;countryCode?:string}>;
        setCompanies(parsed);
        const active = parsed.find(item => item.id === activeId) || parsed[0];
        if (active) { setCompany(active.name); setCompanyId(active.id); }
      } catch { setCompanies([]); }
    }
    const savedWarehouse = localStorage.getItem('salepro_warehouse_id');
    if (savedWarehouse) setSelectedWarehouseId(savedWarehouse);
  }, []);

  useEffect(() => {
    if (!companyId) return;
    const userId = profile && (profile as any).id;
    if (!userId) return;
    let cancelled = false;
    const loadWarehouses = async () => {
      setWarehouseLoading(true); setWarehouseError('');
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
        const token = localStorage.getItem('salepro_access_token');
        const response = await fetch(`${api}/warehouses`, {
          headers: { 'x-user-id': userId, 'x-company-id': companyId, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          cache: 'no-store',
        });
        if (!response.ok) throw new Error((await response.text()) || `Unable to load warehouses (${response.status})`);
        const data = await response.json();
        if (!cancelled) {
          setWarehouses(Array.isArray(data) ? data : []);
          const saved = localStorage.getItem('salepro_warehouse_id') || '';
          if (saved && Array.isArray(data) && data.some((item:any) => item.id === saved)) setSelectedWarehouseId(saved);
          else { setSelectedWarehouseId(''); localStorage.removeItem('salepro_warehouse_id'); }
        }
      } catch (error) {
        if (!cancelled) { setWarehouses([]); setWarehouseError(error instanceof Error ? error.message : 'Unable to load warehouses'); }
      } finally { if (!cancelled) setWarehouseLoading(false); }
    };
    loadWarehouses();
    return () => { cancelled = true; };
  }, [companyId, profile]);

  const selectedWarehouse = warehouses.find(item => item.id === selectedWarehouseId);
  const displayName = profile?.displayName || profile?.email || 'Ahmed Khan';
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setProfileOpen(false); setProfileModalOpen(false); setWarehouseMenuOpen(false); }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, []);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.company-picker-wrap')) setWarehouseMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeMenu);
    return () => document.removeEventListener('pointerdown', closeMenu);
  }, []);

  const logout = () => {
    localStorage.removeItem('salepro_access_token');
    localStorage.removeItem('salepro_refresh_token');
    localStorage.removeItem('salepro_user');
    localStorage.removeItem('salepro_company_id');
    router.replace('/login');
  };
  const toggle = (label: string) => setExpanded((v) => v.includes(label) ? v.filter(x => x !== label) : [...v, label]);

  return <div className="erp-shell reference-shell">
    <Sidebar />

    <main className="erp-main">
      <header className="erp-topbar reference-topbar">
        <button className="icon-button mobile-menu" aria-label="Menu"><Menu size={19}/></button>
        <div className="global-search"><Search size={18}/><input placeholder="Search anything (products, customers, invoices...)"/><kbd>Ctrl K</kbd></div>
        <div className="top-actions">
          <div className="company-picker-wrap">
            <button type="button" className="company-picker" aria-expanded={warehouseMenuOpen} onClick={() => setWarehouseMenuOpen(value => !value)}>
              <Building2 size={20}/><span><strong>{selectedWarehouse?.name || company}</strong><small>{selectedWarehouse?.branch?.name || 'Company workspace'}</small></span><ChevronDown size={14}/>
            </button>
            {warehouseMenuOpen && <div className="warehouse-picker-menu">
              <div className="warehouse-picker-title">{company} · Warehouses</div>
              <button type="button" className={`warehouse-option ${!selectedWarehouseId ? 'active' : ''}`} onClick={() => { setSelectedWarehouseId(''); localStorage.removeItem('salepro_warehouse_id'); setWarehouseMenuOpen(false); }}><Building2 size={15}/><span>All Warehouses</span>{!selectedWarehouseId && <b>✓</b>}</button>
              {warehouseLoading && <div className="warehouse-picker-message">Loading warehouses…</div>}
              {!warehouseLoading && warehouses.map(item => <button type="button" key={item.id} className={`warehouse-option ${selectedWarehouseId === item.id ? 'active' : ''}`} onClick={() => { setSelectedWarehouseId(item.id); localStorage.setItem('salepro_warehouse_id', item.id); setWarehouseMenuOpen(false); }}><Boxes size={15}/><span><strong>{item.name}</strong><small>{item.branch?.name || item.code}</small></span>{selectedWarehouseId === item.id && <b>✓</b>}</button>)}
              {!warehouseLoading && warehouses.length === 0 && <div className="warehouse-picker-message">{warehouseError || 'No warehouses found for this company.'}</div>}
            </div>}
          </div>
          <button type="button" className="pos-icon-button" title="Open POS" aria-label="Open POS" onClick={() => router.push('/pos')}><ShoppingBag size={18}/></button>
          <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19}/><i>5</i></button>
          <button className="icon-button" aria-label="Full screen"><Maximize2 size={17}/></button>
          <button className="icon-button" aria-label="Theme"><Sun size={18}/></button>
          <button className="language-button"><Globe2 size={16}/> English <ChevronDown size={13}/></button>
          <div className="profile-dropdown" ref={profileRef}>
            <button type="button" className="profile-button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-haspopup="menu">
              <span className="avatar">{displayName.slice(0,1).toUpperCase()}</span><span><strong>{displayName}</strong><small>{profile?.position || profile?.role || 'Administrator'}</small></span><ChevronDown size={14}/>
            </button>
            {profileOpen && <div className="profile-menu" role="menu">
              <div className="profile-menu-header"><strong>{displayName}</strong><small>{profile?.email || 'Email not available'}</small><small>{profile?.role || 'Administrator'}</small></div>
              <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); setProfileModalOpen(true); }}><UserRound size={16}/> My Profile</button>
              <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); window.alert('Account settings page is not yet available in this project snapshot.'); }}><Settings size={16}/> Account Settings</button>
              <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); window.alert('My Transactions module is not yet connected.'); }}><FileText size={16}/> My Transactions</button>
              <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); window.alert('My Holiday module is not yet connected.'); }}><CalendarDays size={16}/> My Holiday</button>
              <div className="profile-menu-divider"/>
              <button type="button" role="menuitem" className="logout-menu-item" onClick={logout}>Logout</button>
            </div>}
          </div>
        </div>
      </header>

      <section className="dashboard-content reference-content">
        <div className="reference-heading"><div><h1>Dashboard</h1><p>Welcome back, {displayName.split('@')[0]}! Here&apos;s what&apos;s happening with your business today.</p></div><div className="filters"><label className="date-wrap"><CalendarDays size={16}/><input aria-label="Date range" value={period} onChange={e => setPeriod(e.target.value)}/><ChevronDown size={14}/></label><label className="select-wrap"><select aria-label="Period"><option>This Month</option><option>Last Month</option><option>This Year</option></select><ChevronDown size={14}/></label></div></div>

        <section className="kpi-grid reference-kpis">{kpis.map(({ label, value, change, icon: Icon, tone, down }) => <article className="reference-kpi" key={label}><div className={`reference-kpi-icon ${tone}`}><Icon size={22}/></div><span className="reference-kpi-label">{label}</span><strong>{value}</strong><small className={down ? 'negative' : 'positive'}>{down ? <ArrowDownRight size={16}/> : <ArrowUpRight size={16}/>} {change} <em>vs last month</em></small></article>)}</section>

        <section className="reference-analytics">
          <article className="reference-panel sales-chart-panel"><div className="reference-panel-title"><h2>Sales &amp; Purchases</h2><div className="chart-legend"><span><i className="blue-dot"/>Sales</span><span><i className="green-dot"/>Purchases</span></div></div><div className="reference-bar-chart"><div className="chart-ylabels"><span>200K</span><span>150K</span><span>100K</span><span>50K</span><span>0</span></div><div className="chart-bars">{[['Jan',34,18],['Feb',39,22],['Mar',43,25],['Apr',52,29],['May',56,32],['Jun',57,34],['Jul',61,39],['Aug',67,42],['Sep',72,46],['Oct',81,51],['Nov',91,55],['Dec',96,62]].map(([m,a,b]) => <div className="chart-month" key={m}><div className="bar-pair"><i style={{height:`${a}%`}}/><b style={{height:`${b}%`}}/></div><span>{m}</span></div>)}</div></div></article>
          <article className="reference-panel category-panel"><div className="reference-panel-title"><h2>Sales by Category</h2></div><div className="category-content"><div className="category-donut"><div><strong>SAR 245,890</strong><span>Total Sales</span></div></div><div className="category-legend">{[['Electronics','28%','blue'],['Groceries','22%','green'],['Clothing','18%','orange'],['Home & Living','15%','purple'],['Health & Beauty','10%','pink'],['Others','7%','gray']].map(([n,v,c]) => <div key={n}><i className={c}/><span>{n}</span><b>{v}</b></div>)}</div></div></article>
        </section>

        <section className="reference-tables">
          <article className="reference-panel"><div className="reference-panel-title"><h2>Recent Sales</h2><Link href="#sales">View All</Link></div><div className="table-scroll"><table className="reference-table" suppressHydrationWarning><thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>{sales.map(row => <tr key={row[0]}>{row.map((cell,i) => <td key={i}>{i===4 ? <span className={`status-tag ${cell.toLowerCase()}`}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div></article>
          <article className="reference-panel"><div className="reference-panel-title"><h2>Stock Status</h2><Link href="/products">View All</Link></div><div className="table-scroll"><table className="reference-table" suppressHydrationWarning><thead><tr><th>Product</th><th>Warehouse</th><th>Stock</th><th>Status</th></tr></thead><tbody>{stock.map(row => <tr key={row[1]}><td><span className="product-emoji">{row[0]}</span>{row[1]}</td><td>{row[2]}</td><td className={Number(row[3]) < 10 ? 'stock-low' : ''}>{row[3]}</td><td><span className={`status-tag ${row[4].toLowerCase().replaceAll(' ','-')}`}>{row[4]}</span></td></tr>)}</tbody></table></div></article>
        </section>

        <section className="reference-bottom">
          <article className="reference-panel company-performance"><div className="reference-panel-title"><h2>Company Performance</h2></div><div className="performance-items">{[['Branches','3',Building2,'blue'],['Warehouses','5',Boxes,'orange'],['Employees','24',Users,'blue'],['Active Projects','6',FolderKanban,'purple']].map(([label,value,Icon,tone]) => { const I = Icon as typeof Building2; return <div key={label as string}><span className={`performance-icon ${tone}`}><I size={22}/></span><span><small>{label as string}</small><strong>{value as string}</strong></span></div>; })}</div></article>
          <article className="reference-panel quick-actions"><div className="reference-panel-title"><h2>Quick Actions</h2></div><div className="quick-action-items">{[['New Sale',ShoppingCart,'green'],['New Purchase',Truck,'blue'],['Add Product',Package,'orange'],['Create Invoice',FileText,'purple'],['View Reports',BarChart3,'cyan']].map(([label,Icon,tone]) => { const I = Icon as typeof ShoppingCart; return <Link href={label === 'Add Product' ? '/products' : label === 'View Reports' ? '#reports' : '#'} className={`quick-action ${tone}`} key={label as string}><I size={24}/><span>{label as string}</span></Link>; })}</div></article>
        </section>
        {profileModalOpen && <div className="profile-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileModalOpen(false); }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <button type="button" className="profile-modal-close" aria-label="Close profile" onClick={() => setProfileModalOpen(false)}>×</button>
            <h2 id="profile-modal-title">My Profile</h2>
            <div className="profile-modal-avatar">{displayName.slice(0,1).toUpperCase()}</div>
            <p><strong>Name:</strong> {displayName}</p>
            <p><strong>Email:</strong> {profile?.email || 'Not available'}</p>
            <p><strong>Position:</strong> {profile?.position || 'Not available'}</p>
            <p><strong>Role:</strong> {profile?.role || 'Administrator'}</p>
          </section>
        </div>}
        <footer className="dashboard-footer">© 2026 SALLA WORKSPACE. All rights reserved. <span>Help · Documentation</span></footer>
      </section>
    </main>
  </div>;
}
