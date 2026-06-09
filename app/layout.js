import React from 'react';
import { cookies } from 'next/headers';
import ClientLayoutWrapper from '@/components/Layout/ClientLayoutWrapper';
import { Rajdhani, Space_Grotesk } from 'next/font/google';
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export const metadata = {
  title: "Goin' Yard HQ",
  description: "AI Fantasy Baseball Intelligence",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const galacticModeEnabled = cookieStore.get('galactic_mode')?.value === 'true';

  return (
    <html 
      lang="en" 
      className={`${rajdhani.variable} ${spaceGrotesk.variable}`}
      data-theme={galacticModeEnabled ? 'galactic' : 'standard'}
    >
      <body>
        <ClientLayoutWrapper initialGalacticMode={galacticModeEnabled}>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
