import './globals.css';
import Providers from '@/components/Providers';
export const metadata = {
  title: 'SallaClone | OW Platform',
  description: 'SallaClone public website and OW Platform workspace.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
