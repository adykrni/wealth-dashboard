import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wealth Dashboard — Deutsche Bank EWM',
  description: 'Consolidated wealth management cockpit prototype',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-[#f9fbfd]">{children}</body>
    </html>
  );
}
