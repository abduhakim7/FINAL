import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
});

export const fontVariables = cn(fontInter.variable);
