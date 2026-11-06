import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { Globe, FileText, Package, Layers, CreditCard, Image, Search, MessageSquare, ExternalLink, ArrowUpRight } from 'lucide-react';
const tools = [
  {title:'Pages',description:'Create and publish website pages',href:'/website/pages',icon:FileText,count:'12 pages'},
  {title:'Products',description:'Manage public product pages',href:'/website/products',icon:Package,count:'14 items'},
  {title:'Solutions',description:'Manage industry landing pages',href:'/website/solutions',icon:Layers,count:'8 solutions'},
  {title:'Features',description:'Edit platform feature descriptions',href:'/website/features',icon:Globe,count:'18 features'},
  {title:'Pricing',description:'Control public pricing presentation',href:'/website/pricing',icon:CreditCard,count:'4 plans'},
  {title:'Blog',description:'Publish articles and updates',href:'/website/blog',icon:FileText,count:'6 articles'},
  {title:'Media Library',description:'Organize website images and files',href:'/website/media',icon:Image,count:'32 assets'},
  {title:'SEO Settings',description:'Metadata, indexing and sitemap',href:'/website/seo',icon:Search,count:'SEO tools'},
  {title:'Contact Requests',description:'Review demo and contact enquiries',href:'/website/contacts',icon:MessageSquare,count:'3 new'},
];
export default function WebsiteManagement(){return <AppLayout title="Website Management" subtitle="Manage the public SallaClone marketing website from your OW Platform workspace." titleActions={<a href="/" target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'10px 14px',borderRadius:9,background:'#2563eb',color:'#fff',textDecoration:'none',fontWeight:700,fontSize:13}}>View Website <ExternalLink size={15}/></a>}>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:15,marginTop:22}}>{[['Website Status','Published','Public website'],['Website Address','https://sallaclone.com','Public marketing website'],['Published Pages','12','Content overview'],['New Enquiries','3','Awaiting review']].map(([a,b,c])=><div key={a} style={{background:'#fff',border:'1px solid #e6ebf2',borderRadius:13,padding:19}}><div style={{fontSize:12,color:'#738198'}}>{a}</div><div style={{fontSize:22,fontWeight:800,color:'#172f53',margin:'9px 0'}}>{b}</div><div style={{fontSize:12,color:'#8491a4'}}>{c}</div></div>)}</div>
  <div style={{marginTop:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:14}}>{tools.map(({title,description,href,icon:Icon,count})=><Link key={href} href={href} style={{display:'flex',gap:14,alignItems:'flex-start',padding:19,border:'1px solid #e5eaf1',borderRadius:13,background:'#fff',textDecoration:'none',color:'inherit'}}><div style={{width:42,height:42,display:'grid',placeItems:'center',borderRadius:11,background:'#edf4ff',color:'#2563eb'}}><Icon size={20}/></div><div style={{flex:1}}><div style={{fontWeight:800,marginBottom:5}}>{title}</div><div style={{fontSize:12,color:'#718096',lineHeight:1.5}}>{description}</div><div style={{fontSize:11,color:'#2563eb',fontWeight:700,marginTop:10}}>{count} <ArrowUpRight size={12} style={{display:'inline',verticalAlign:'middle'}}/></div></div></Link>)}</div>
  <div style={{marginTop:24,padding:20,borderRadius:13,background:'#eff6ff',border:'1px solid #d9e8ff'}}><strong style={{color:'#1e3a66'}}>Website and application structure</strong><p style={{fontSize:13,color:'#526781',lineHeight:1.7,marginBottom:0}}>ERP, SaaS Admin and Customer Portal remain part of the common OW Platform APP. This Website section manages the separate public marketing website. Existing ERP modules, SaaS routes and database records are retained.</p></div>
</AppLayout>}
