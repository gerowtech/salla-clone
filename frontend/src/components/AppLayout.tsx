import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout({ title, subtitle, titleActions, children }: { title: string; subtitle?: string; titleActions?: ReactNode; children: ReactNode }) {
  return (
    <div className="erp-shell reference-shell">
      <Sidebar />
      <main className="erp-main">
        <Header />
        <section className="dashboard-content reference-content">
          <div className="welcome-row" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}><div><h1>{title}</h1>{subtitle && <p className="muted-copy">{subtitle}</p>}</div>{titleActions && <div style={{display:'flex',alignItems:'center',gap:5,marginLeft:'auto'}}>{titleActions}</div>}</div>
          {children}
          <Footer />
        </section>
      </main>
    </div>
  );
}
