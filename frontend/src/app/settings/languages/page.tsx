'use client';
import {useLanguage,LANGUAGES} from '@/i18n/LanguageProvider';
import {Globe2, CheckCircle2} from 'lucide-react';
export default function LanguagesPage(){
 const {code,setCode}=useLanguage();
 return <div className="module-page">
  <div className="module-toolbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap',marginBottom:20}}>
   <div><h2 style={{margin:0}}>Languages &amp; Translations</h2><p className="muted-copy">Choose the interface language. Your selection is saved in this browser and applies across ERP pages.</p></div>
   <div className="language-button"><Globe2 size={17}/><strong>{LANGUAGES.find(x=>x.code===code)?.name}</strong><CheckCircle2 size={16}/></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
   {LANGUAGES.map(lang=><button key={lang.code} type="button" onClick={()=>setCode(lang.code)} aria-pressed={code===lang.code} style={{textAlign:'left',padding:18,borderRadius:12,border:code===lang.code?'2px solid #1683f8':'1px solid #dbe3ef',background:code===lang.code?'#eff6ff':'white',color:'#17243a',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
    <span><strong style={{display:'block'}}>{lang.name}</strong><small style={{color:'#718096'}}> {lang.code.toUpperCase()} </small></span>{code===lang.code&&<CheckCircle2 size={19} color="#1683f8"/>}
   </button>)}
  </div>
  <div style={{marginTop:20,padding:16,borderRadius:10,background:'#fff8e8',color:'#795b18',fontSize:13}}>Language names and codes are loaded from the supplied languages.sql list. Full translations require translated dictionaries; English, Arabic, Spanish, French, German and Turkish currently have starter interface translations. Other languages remain selectable but display the existing English text until translations are added.</div>
 </div>
}
