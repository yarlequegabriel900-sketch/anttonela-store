import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PRENDAS ANTTONELA | Mayoristas',
  description: 'Catálogo mayorista de PRENDAS ANTTONELA. Pedidos por docena y coordinación por WhatsApp.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
