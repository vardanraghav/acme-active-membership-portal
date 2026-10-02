import type { Metadata } from 'next';
import './globals.css';
import { SOCIETY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SOCIETY_INFO.portalTitle} | ${SOCIETY_INFO.university}`,
  description: `Official Active Membership Portal for ${SOCIETY_INFO.name}, ${SOCIETY_INFO.department}, ${SOCIETY_INFO.university}.`,
  icons: {
    icon: '/images/acme-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-acme-100 selection:text-acme-900">
        {children}
      </body>
    </html>
  );
}
