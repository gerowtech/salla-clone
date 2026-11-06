'use client';
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
export const LANGUAGES = [
 {code:'en',name:'English'},{code:'bn',name:'Bangla'},{code:'ar',name:'Arabic'},{code:'al',name:'Albania'},{code:'az',name:'Azerbaijan'},{code:'bg',name:'Bulgaria'},{code:'de',name:'Germany'},{code:'es',name:'Spanish'},{code:'fr',name:'French'},{code:'id',name:'Indonesian'},{code:'tr',name:'Turkish'},{code:'vi',name:'Vietnamese'},{code:'pt',name:'Portuguese'},{code:'ms',name:'Malay'},{code:'sr',name:'Serbian'}
] as const;
const words: Record<string,Record<string,string>> = {
 ar:{Dashboard:'لوحة التحكم',People:'الأشخاص',Product:'المنتجات',Purchase:'المشتريات',Sale:'المبيعات',Accounting:'المحاسبة',Reports:'التقارير',Settings:'الإعدادات',Addons:'الإضافات',Search:'بحث',English:'العربية',Notifications:'الإشعارات',Logout:'تسجيل الخروج','Company workspace':'مساحة عمل الشركة','All Warehouses':'كل المستودعات','Languages & Translations':'اللغات والترجمات'},
 es:{Dashboard:'Panel',People:'Personas',Product:'Productos',Purchase:'Compras',Sale:'Ventas',Accounting:'Contabilidad',Reports:'Informes',Settings:'Configuración',Addons:'Complementos',Search:'Buscar',Logout:'Cerrar sesión'},
 fr:{Dashboard:'Tableau de bord',People:'Personnes',Product:'Produits',Purchase:'Achats',Sale:'Ventes',Accounting:'Comptabilité',Reports:'Rapports',Settings:'Paramètres',Addons:'Modules',Search:'Rechercher',Logout:'Déconnexion'},
 de:{Dashboard:'Dashboard',People:'Personen',Product:'Produkte',Purchase:'Einkauf',Sale:'Verkauf',Accounting:'Buchhaltung',Reports:'Berichte',Settings:'Einstellungen',Addons:'Erweiterungen',Search:'Suchen',Logout:'Abmelden'},
 tr:{Dashboard:'Kontrol Paneli',People:'Kişiler',Product:'Ürünler',Purchase:'Satın Alma',Sale:'Satış',Accounting:'Muhasebe',Reports:'Raporlar',Settings:'Ayarlar',Addons:'Eklentiler',Search:'Ara',Logout:'Çıkış'}
};
type Ctx={code:string; setCode:(v:string)=>void; t:(v:string)=>string};
const LanguageContext=createContext<Ctx>({code:'en',setCode:()=>{},t:v=>v});
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [code,setCodeState]=useState('en');
 useEffect(()=>{const saved=localStorage.getItem('salla_language')||'en';setCodeState(LANGUAGES.some(x=>x.code===saved)?saved:'en');},[]);
 useEffect(()=>{document.documentElement.lang=code;document.documentElement.dir=code==='ar'?'rtl':'ltr';document.documentElement.dataset.language=code;},[code]);
 const setCode=(v:string)=>{if(!LANGUAGES.some(x=>x.code===v))return;setCodeState(v);localStorage.setItem('salla_language',v);};
 const value=useMemo(()=>({code,setCode,t:(v:string)=>words[code]?.[v]||v}),[code]);
 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage=()=>useContext(LanguageContext);
