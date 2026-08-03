import { Pricing } from '@/components/marketing/pricing';
import { CtaBanner } from '@/components/marketing/cta-banner';

export const metadata = {
  title: 'Pricing — Formix AI Form Builder',
  description: 'Simple and transparent EGP pricing plans for Formix AI form generator.',
};

export default function PricingPage() {
  return (
    <div className="pt-20">
      <Pricing />
      <CtaBanner />
    </div>
  );
}
