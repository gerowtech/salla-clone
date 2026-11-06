'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Plus, Search, Pencil, Trash2, Save, Undo2, ShieldCheck, X } from 'lucide-react';

type RoleRow = { id: string; role: string; accessLevel: string; description: string };
type RoleForm = { role: string; accessLevel: string; description: string };
const STORAGE_KEY = 'sallapro_role_permissions_v1';
const defaults: RoleRow[] = [
  { id: 'role-admin', role: 'Admin', accessLevel: 'Global', description: 'Access to all shops and system data.' },
  { id: 'role-owner', role: 'Owner', accessLevel: 'Shop-level', description: 'Manages their own shop and employees.' },
  { id: 'role-staff', role: 'Staff', accessLevel: 'Permission-based', description: 'Accesses only features assigned by the Owner.' },
  { id: 'role-chef', role: 'Chef', accessLevel: 'Kitchen-level', description: 'Manages kitchen orders and preparation status.' },
];
const blank: RoleForm = { role: '', accessLevel: 'Permission-based', description: '' };

export default function RolePermissionPage() {
  const [roles, setRoles] = useState<RoleRow[]>(defaults);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [form, setForm] = useState<RoleForm>(blank);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRoles(parsed);
      }
    } catch { /* Keep the built-in starter roles if saved data is unavailable. */ }
  }, []);

  const persist = (next: RoleRow[]) => {
    setRoles(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const filtered = useMemo(() => roles.filter(r => `${r.role} ${r.accessLevel} ${r.description}`.toLowerCase().includes(query.toLowerCase())), [roles, query]);
  const startAdd = () => { setEditing(null); setForm(blank); setError(''); setNotice(''); setOpen(true); };
  const startEdit = (role: RoleRow) => { setEditing(role); setForm({ role: role.role, accessLevel: role.accessLevel, description: role.description }); setError(''); setNotice(''); setOpen(true); };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.role.trim();
    if (!name || !form.accessLevel || !form.description.trim()) { setError('Please complete all fields.'); return; }
    if (roles.some(r => r.role.toLowerCase() === name.toLowerCase() && r.id !== editing?.id)) { setError('A role with this name already exists.'); return; }
    if (editing) {
      persist(roles.map(r => r.id === editing.id ? { ...r, ...form, role: name, description: form.description.trim() } : r));
      setNotice('Role updated successfully.');
    } else {
      persist([...roles, { id: `role-${Date.now()}`, ...form, role: name, description: form.description.trim() }]);
      setNotice('Role created successfully.');
    }
    setOpen(false);
  };
  const remove = (role: RoleRow) => {
    if (['Admin', 'Owner'].includes(role.role)) { setNotice(`${role.role} is a protected system role and cannot be deleted.`); return; }
    if (!window.confirm(`Delete the ${role.role} role?`)) return;
    persist(roles.filter(r => r.id !== role.id));
    setNotice(`${role.role} role deleted.`);
  };

  return <AppLayout title="Role Permission" titleActions={<button type="button" title="Add role" aria-label="Add role" onClick={startAdd} style={{ width: 30, height: 30, border: '1px solid #087fbd', borderRadius: 2, background: '#168fce', color: '#fff', display: 'inline-grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}><Plus size={15} /></button>}>
    <div className="panel table-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <div><h2 style={{ margin: 0, fontSize: 17, color: '#17212f' }}>User roles</h2><p style={{ margin: '4px 0 0', fontSize: 12, color: '#718096' }}>Manage roles and their access levels.</p></div>
        <label className="page-search" style={{ width: 'min(100%, 320px)' }}><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search roles..." /></label>
      </div>
      {notice && <div className="notice-success" role="status" style={{ marginBottom: 12 }}>{notice}</div>}
      <div style={{ overflowX: 'auto', border: '1px solid #d7dde5', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#17212f' }}>
          <thead><tr>{['Role', 'Access level', 'Description', 'Actions'].map(label => <th key={label} style={{ textAlign: label === 'Actions' ? 'center' : 'left', padding: '11px 12px', background: '#f8fafc', color: '#1686d8', fontWeight: 600, border: '1px solid #d7dde5', whiteSpace: 'nowrap' }}>{label}</th>)}</tr></thead>
          <tbody>{filtered.map(role => <tr key={role.id}>
            <td style={{ padding: '12px', border: '1px solid #d7dde5', fontWeight: 600 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><ShieldCheck size={15} color="#168fce" />{role.role}</span></td>
            <td style={{ padding: '12px', border: '1px solid #d7dde5' }}><span style={{ display: 'inline-block', borderRadius: 20, padding: '4px 9px', background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600 }}>{role.accessLevel}</span></td>
            <td style={{ padding: '12px', border: '1px solid #d7dde5', minWidth: 260 }}>{role.description}</td>
            <td style={{ padding: '7px 8px', textAlign: 'center', border: '1px solid #d7dde5', whiteSpace: 'nowrap' }}><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7 }}><button type="button" title="Edit role" aria-label={`Edit ${role.role}`} onClick={() => startEdit(role)} style={{ width: 30, height: 30, border: '1px solid #1686c9', borderRadius: 2, background: '#168fce', color: '#fff', display: 'inline-grid', placeItems: 'center', cursor: 'pointer' }}><Pencil size={14} /></button><button type="button" title="Delete role" aria-label={`Delete ${role.role}`} onClick={() => remove(role)} style={{ width: 30, height: 30, border: '1px solid #d83b32', borderRadius: 2, background: '#ed493e', color: '#fff', display: 'inline-grid', placeItems: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button></div></td>
          </tr>)}
          {filtered.length === 0 && <tr><td colSpan={4} style={{ padding: 28, textAlign: 'center', color: '#718096' }}>No roles found.</td></tr>}</tbody>
        </table>
      </div>
      <div style={{ paddingTop: 12, fontSize: 12, color: '#718096' }}>Showing {filtered.length} of {roles.length} roles</div>
    </div>
    {open && <div role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.48)', display: 'grid', placeItems: 'center', padding: 18 }}>
      <section role="dialog" aria-modal="true" aria-labelledby="role-form-title" className="panel" style={{ width: 'min(100%, 520px)', padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="panel-heading" style={{ marginBottom: 18 }}><div><h2 id="role-form-title">{editing ? 'Edit role' : 'Add role'}</h2><p>{editing ? 'Update role details and access level.' : 'Create a new user role.'}</p></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>
        {error && <div className="notice-error" role="alert">{error}</div>}
        <form onSubmit={save} style={{ display: 'grid', gap: 14 }}>
          <label className="form-field"><span>Role *</span><input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Enter role name" /></label>
          <label className="form-field"><span>Access level *</span><select required value={form.accessLevel} onChange={e => setForm({ ...form, accessLevel: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dbe2ea', borderRadius: 8, background: '#fff' }}><option>Global</option><option>Shop-level</option><option>Permission-based</option><option>Kitchen-level</option></select></label>
          <label className="form-field"><span>Description *</span><textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what this role can access" style={{ width: '100%', padding: '10px 12px', border: '1px solid #dbe2ea', borderRadius: 8, resize: 'vertical' }} /></label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginTop: 6 }}><button type="submit" title="Save" aria-label="Save" style={{ width: 30, height: 30, border: '1px solid #087fbd', borderRadius: 2, background: '#168fce', color: '#fff', display: 'inline-grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}><Save size={14} /></button><button type="button" title="Cancel" aria-label="Cancel" onClick={() => setOpen(false)} style={{ width: 30, height: 30, border: '1px solid #cbd5e1', borderRadius: 2, background: '#fff', color: '#17212f', display: 'inline-grid', placeItems: 'center', cursor: 'pointer', padding: 0 }}><Undo2 size={14} /></button></div>
        </form>
      </section>
    </div>}
  </AppLayout>;
}
