import { Hero } from '@/components/marketing/hero';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { Features } from '@/components/marketing/features';
import { LiveDemo } from '@/components/marketing/live-demo';
import { Pricing } from '@/components/marketing/pricing';
import { CtaBanner } from '@/components/marketing/cta-banner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formix — AI-Powered Form Builder SaaS',
  description:
    'Describe any form in plain natural language → Formix generates complete, professional forms in seconds. Edit with AI, publish, and analyze responses.',
  openGraph: {
    title: 'Formix — AI-Powered Form Generation Platform',
    description:
      'Describe any form in plain natural language → Formix generates complete, professional forms in seconds.',
    type: 'website',
  },
};

export default function MarketingPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <Pricing />
      <CtaBanner />
    </main>
  );
}
