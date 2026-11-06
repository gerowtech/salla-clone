'use client';

import AppLayout from '@/components/AppLayout';
import { useEffect, useMemo, useState } from 'react';
import {
  Wrench, ClipboardList, ShoppingCart, FileCheck2, Utensils, Dumbbell,
  Smartphone, ArrowUpRight, Power, Check, Megaphone, MessageCircle,
  Users, UserRound, Bot, ChartNoAxesCombined, Search, SlidersHorizontal,
  Sparkles, Calculator, Wallet, CreditCard, Store, Package, Truck, Hotel, GraduationCap,
  HeartPulse, Building2, HardHat, CalendarClock, Headset, FileSignature, Network, Layers,
} from 'lucide-react';

type Addon = {
  id: string; name: string; category: string; description: string;
  features: string[]; color: string; icon: typeof Wrench; revenuePotential: 'Very High' | 'High';
};

const addons: Addon[] = [
  { id: 'ai-assistant', name: 'AI Business Assistant', category: 'AI & Analytics', description: 'AI-powered support for everyday decisions, business insights and automated reporting.', features: ['AI chatbot', 'Business insights', 'Automated reports'], color: 'teal', icon: Bot, revenuePotential: 'Very High' },
  { id: 'accounting', name: 'Accounting & Finance', category: 'Finance & Compliance', description: 'Manage core accounting records and understand business financial performance.', features: ['General ledger', 'Balance sheet', 'Profit & loss', 'Cash flow'], color: 'green', icon: Calculator, revenuePotential: 'Very High' },
  { id: 'hrm-payroll', name: 'HRM & Payroll', category: 'People & HR', description: 'Manage employees and payroll processes in one place.', features: ['Employees', 'Salaries', 'Leaves', 'Attendance'], color: 'blue', icon: UserRound, revenuePotential: 'Very High' },
  { id: 'crm-sales', name: 'CRM & Sales Automation', category: 'Sales & Marketing', description: 'Organize prospects, sales opportunities and customer follow-ups.', features: ['Leads', 'Sales pipelines', 'Follow-ups', 'Customer management'], color: 'violet', icon: Users, revenuePotential: 'Very High' },
  { id: 'subscription-billing', name: 'Subscription & Recurring Billing', category: 'Finance & Compliance', description: 'Run recurring billing and manage customer subscription lifecycles.', features: ['Recurring payments', 'Plans', 'Invoices', 'Renewals'], color: 'orange', icon: CreditCard, revenuePotential: 'Very High' },
  { id: 'marketplace', name: 'E-Commerce Marketplace', category: 'Sales & Marketing', description: 'Operate a multi-vendor marketplace with centralized order and commission workflows.', features: ['Multi-vendor stores', 'Commissions', 'Orders'], color: 'pink', icon: Store, revenuePotential: 'Very High' },
  { id: 'warehouse-inventory', name: 'Warehouse & Inventory', category: 'Business Operations', description: 'Control stock across locations and streamline inventory movement.', features: ['Multiple warehouses', 'Stock transfers', 'Barcode'], color: 'blue', icon: Package, revenuePotential: 'Very High' },
  { id: 'procurement', name: 'Procurement Management', category: 'Business Operations', description: 'Manage purchasing workflows and supplier coordination.', features: ['Purchase requests', 'Approvals', 'Suppliers'], color: 'teal', icon: ClipboardList, revenuePotential: 'High' },
  { id: 'fleet-logistics', name: 'Fleet & Logistics', category: 'Business Operations', description: 'Coordinate vehicles, drivers and delivery operations.', features: ['Vehicles', 'Drivers', 'Deliveries', 'Tracking'], color: 'orange', icon: Truck, revenuePotential: 'High' },
  { id: 'restaurant-hospitality', name: 'Restaurant & Hospitality', category: 'Industry Solutions', description: 'Manage front-of-house and kitchen operations for restaurants.', features: ['Tables', 'Reservations', 'Kitchen management'], color: 'pink', icon: Utensils, revenuePotential: 'High' },
  { id: 'hotel', name: 'Hotel Management', category: 'Industry Solutions', description: 'Coordinate guest stays and hotel property operations.', features: ['Reservations', 'Rooms', 'Housekeeping', 'Check-in'], color: 'purple', icon: Hotel, revenuePotential: 'High' },
  { id: 'education', name: 'Education Management', category: 'Industry Solutions', description: 'Manage student administration and academic workflows.', features: ['Students', 'Fees', 'Attendance', 'Examinations'], color: 'blue', icon: GraduationCap, revenuePotential: 'High' },
  { id: 'healthcare', name: 'Healthcare Management', category: 'Industry Solutions', description: 'Coordinate patient services and healthcare administration.', features: ['Patients', 'Appointments', 'Billing', 'Pharmacy'], color: 'green', icon: HeartPulse, revenuePotential: 'High' },
  { id: 'real-estate', name: 'Real Estate Management', category: 'Industry Solutions', description: 'Track property portfolios, tenants and rental agreements.', features: ['Properties', 'Tenants', 'Rent', 'Contracts'], color: 'teal', icon: Building2, revenuePotential: 'High' },
  { id: 'construction', name: 'Construction Management', category: 'Industry Solutions', description: 'Manage construction delivery, contractors and project costs.', features: ['Projects', 'Contractors', 'Budgets', 'Materials'], color: 'orange', icon: HardHat, revenuePotential: 'High' },
  { id: 'booking-appointments', name: 'Booking & Appointment Management', category: 'Business Operations', description: 'Let customers book services and coordinate staff availability.', features: ['Online booking', 'Staff calendars', 'Reminders'], color: 'violet', icon: CalendarClock, revenuePotential: 'High' },
  { id: 'marketing-automation', name: 'Marketing Automation', category: 'Sales & Marketing', description: 'Automate campaigns and target customer segments across channels.', features: ['Email campaigns', 'SMS', 'Customer segmentation'], color: 'pink', icon: Megaphone, revenuePotential: 'High' },
  { id: 'helpdesk', name: 'Helpdesk & Ticket Management', category: 'Customer Experience', description: 'Centralize customer support requests and service-level workflows.', features: ['Customer support', 'Tickets', 'SLA', 'Live chat'], color: 'blue', icon: Headset, revenuePotential: 'High' },
  { id: 'documents-contracts', name: 'Document & Contract Management', category: 'Business Operations', description: 'Store business documents and manage agreement approval workflows.', features: ['Digital signatures', 'Documents', 'Approvals'], color: 'slate', icon: FileSignature, revenuePotential: 'High' },
  { id: 'franchise', name: 'Franchise Management', category: 'Business Operations', description: 'Manage franchise locations, fees and consolidated performance.', features: ['Multiple branches', 'Franchise fees', 'Reporting'], color: 'purple', icon: Network, revenuePotential: 'High' },

  { id: 'saas-platform', name: 'SaaS Platform', category: 'Platform & Administration', description: 'Manage a multi-tenant SaaS business, customer workspaces, plans, subscriptions and platform operations.', features: ['Tenant and workspace management', 'Subscription plans and billing', 'Tenant onboarding and provisioning', 'Platform usage and analytics'], color: 'violet', icon: Layers, revenuePotential: 'Very High' },
  { id: 'service-repair', name: 'Service & Repair Management', category: 'Service Operations', description: 'Manage service requests, repair jobs, technicians, parts and customer service history.', features: ['Service requests', 'Repair job cards', 'Technician assignment', 'Parts and labor tracking'], color: 'orange', icon: Wrench, revenuePotential: 'High' },
  { id: 'project-task', name: 'Project & Task Management', category: 'Business Operations', description: 'Plan projects, assign work and monitor delivery across teams.', features: ['Projects and milestones', 'Task assignment', 'Progress tracking', 'Team collaboration'], color: 'blue', icon: ClipboardList, revenuePotential: 'Very High' },
  { id: 'ecommerce-management', name: 'E-Commerce Management', category: 'Sales & Marketing', description: 'Manage online storefronts, product catalogs, orders and fulfillment.', features: ['Online store', 'Product catalog', 'Order management', 'Shipping and fulfillment'], color: 'pink', icon: ShoppingCart, revenuePotential: 'Very High' },
  { id: 'einvoicing-tax', name: 'E-Invoicing & Tax Compliance', category: 'Finance & Compliance', description: 'Manage electronic invoicing and country-specific tax compliance workflows.', features: ['E-invoice generation', 'Tax calculations', 'Authority submissions', 'Compliance records'], color: 'green', icon: FileCheck2, revenuePotential: 'Very High' },
  { id: 'restaurant-pos', name: 'Restaurant & POS Management', category: 'Industry Solutions', description: 'Run restaurant sales and service operations from a connected point of sale.', features: ['POS orders', 'Tables and floor plan', 'Kitchen tickets', 'Menu management'], color: 'orange', icon: Utensils, revenuePotential: 'Very High' },
  { id: 'fitness-gym', name: 'Fitness & Gym Management', category: 'Industry Solutions', description: 'Manage gym memberships, class schedules, trainers and attendance.', features: ['Membership plans', 'Member check-in', 'Trainer schedules', 'Class bookings'], color: 'purple', icon: Dumbbell, revenuePotential: 'High' },
  { id: 'mobile-app-management', name: 'Mobile App Management', category: 'Digital & Integrations', description: 'Coordinate mobile app access, releases, notifications and connected app settings.', features: ['App configuration', 'Push notifications', 'Release management', 'User engagement'], color: 'blue', icon: Smartphone, revenuePotential: 'High' },
  { id: 'adtech-management', name: 'Advertising & Marketing Management (AdTech)', category: 'Sales & Marketing', description: 'Plan and monitor digital advertising campaigns, audiences and performance.', features: ['Campaign management', 'Audience targeting', 'Budget and bidding', 'Performance analytics'], color: 'pink', icon: Megaphone, revenuePotential: 'Very High' },
  { id: 'whatsapp-business', name: 'WhatsApp Business Integration', category: 'Digital & Integrations', description: 'Connect customer conversations and business notifications through WhatsApp.', features: ['WhatsApp messaging', 'Message templates', 'Order notifications', 'Conversation management'], color: 'green', icon: MessageCircle, revenuePotential: 'Very High' },
  { id: 'crm-management', name: 'Customer Relationship Management (CRM)', category: 'Sales & Marketing', description: 'Centralize customer profiles, sales opportunities and relationship history.', features: ['Customer profiles', 'Lead management', 'Sales pipeline', 'Follow-up reminders'], color: 'violet', icon: Users, revenuePotential: 'Very High' },
  { id: 'hrm-payroll-management', name: 'Human Resources & Payroll Management (HRM)', category: 'People & HR', description: 'Manage employee records, attendance, leave and payroll administration.', features: ['Employee records', 'Attendance and leave', 'Payroll processing', 'HR reports'], color: 'blue', icon: UserRound, revenuePotential: 'Very High' },
];

const STORAGE_KEY = 'ow-platform-enabled-addons';

export default function AddonsPage() {
  const [enabled, setEnabled] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [details, setDetails] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEnabled(JSON.parse(saved));
    } catch { /* Ignore invalid local browser storage. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
  }, [enabled, ready]);

  const categories = useMemo(() => ['All categories', ...Array.from(new Set(addons.map(a => a.category)))], []);
  const filtered = addons.filter(addon => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [addon.name, addon.description, addon.category, ...addon.features].join(' ').toLowerCase().includes(term);
    const matchesCategory = category === 'All categories' || addon.category === category;
    const active = enabled.includes(addon.id);
    const matchesStatus = status === 'All' || (status === 'Active' ? active : !active);
    return matchesQuery && matchesCategory && matchesStatus;
  });

  const toggleAddon = (id: string) => setEnabled(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  return (
    <AppLayout title="Addons" subtitle="Extend OW Platform with optional business modules and integrations.">
      <section className="addon-intro">
        <div>
          <span className="addon-intro-kicker"><Sparkles size={13} /> OW PLATFORM MARKETPLACE</span>
          <h2>One platform. More possibilities.</h2>
          <p>Discover business tools, activate the modules you need and manage them from one place.</p>
        </div>
        <div className="addon-intro-stats">
          <div><strong>{addons.length}</strong><span>Available addons</span></div>
          <div><strong>{enabled.length}</strong><span>Activated</span></div>
        </div>
      </section>

      <section className="addon-toolbar" aria-label="Filter addons">
        <label className="addon-search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search addons, features..." /></label>
        <label className="addon-select"><SlidersHorizontal size={14} /><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label>
        <select className="addon-status-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by activation status"><option>All</option><option>Active</option><option>Available</option></select>
      </section>

      <div className="addon-results-line"><span>{filtered.length} addon{filtered.length === 1 ? '' : 's'} found</span><span>Activation preferences are saved in this browser.</span></div>

      {filtered.length ? <div className="addons-grid">
        {filtered.map(addon => {
          const Icon = addon.icon;
          const active = enabled.includes(addon.id);
          return <article className="addon-card" key={addon.id}>
            <div className="addon-card-top"><div className={`addon-icon ${addon.color}`}><Icon size={21} /></div><span className={`addon-badge ${active ? 'active' : ''}`}><i />{active ? 'Active' : 'Available'}</span></div>
            <h2>{addon.name}</h2>
            <p className="addon-category">{addon.category}</p>
            <span className={`addon-revenue ${addon.revenuePotential === 'Very High' ? 'very-high' : 'high'}`}>{addon.revenuePotential} Revenue Potential</span>
            <p className="addon-description">{addon.description}</p>
            <ul className="addon-features">{addon.features.map(feature => <li key={feature}><Check size={12} />{feature}</li>)}</ul>
            {details === addon.id && <div className="addon-detail-note"><strong>{addon.name}</strong><span>Module overview and feature list. Connectors, subscription pricing and server-side activation can be configured when this addon is integrated.</span></div>}
            <div className="addon-actions"><button className={`addon-activate ${active ? 'is-active' : ''}`} onClick={() => toggleAddon(addon.id)}><Power size={14} />{active ? 'Deactivate' : 'Activate'}</button><button className="addon-details" aria-label={`Details for ${addon.name}`} aria-expanded={details === addon.id} onClick={() => setDetails(details === addon.id ? null : addon.id)}><ArrowUpRight size={16} /></button></div>
          </article>;
        })}
      </div> : <div className="addon-no-results"><Search size={22} /><strong>No addons found</strong><span>Try another search or clear your filters.</span><button onClick={() => { setQuery(''); setCategory('All categories'); setStatus('All'); }}>Clear filters</button></div>}
    </AppLayout>
  );
}
