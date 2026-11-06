'use client';

import AppLayout from '@/components/AppLayout';
import { useState } from 'react';
import { Search, Plus, Download, Filter, ArrowUpRight } from 'lucide-react';

export default function ModuleLanding({ title }: { title: string }) {
  const [query, setQuery] = useState('');
  return <AppLayout title={title} subtitle={`Manage ${title.toLowerCase()} in your Salla workspace.`}>
    <div className="panel" style={{padding:20, marginBottom:18}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}>
        <div><h2 style={{fontSize:18,margin:'0 0 6px'}}> {title} </h2><p className="muted-copy" style={{margin:0}}>Workspace page is ready. Connect records and actions to your business workflow.</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="pos-button" type="button"><Plus size={15}/> Add New</button><button className="icon-button" type="button" aria-label="Export"><Download size={16}/></button></div>
      </div>
    </div>
    <div className="panel" style={{padding:18}}>
      <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap'}}>
        <label className="global-search" style={{maxWidth:380,margin:0}}><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} /></label>
        <button className="language-button" type="button"><Filter size={15}/> Filters</button>
      </div>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr>{['Reference','Name','Status','Updated','Action'].map(x=><th key={x} style={{textAlign:'left',padding:'12px 10px',background:'var(--panel-muted, #f5f7fb)',whiteSpace:'nowrap'}}>{x}</th>)}</tr></thead>
        <tbody><tr><td colSpan={5} style={{padding:30,textAlign:'center',color:'var(--muted, #718096)'}}>No {title.toLowerCase()} records yet. Add your first record to get started.</td></tr></tbody>
      </table></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:14,fontSize:12,color:'var(--muted, #718096)'}}><span>Showing 0 records</span><span>Page 1 of 1</span></div>
    </div>
  </AppLayout>;
}
