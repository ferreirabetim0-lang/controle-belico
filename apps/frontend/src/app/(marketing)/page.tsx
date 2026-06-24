import { HeroSection } from '@/components/landing/hero-section'
import { BenefitsSection } from '@/components/landing/benefits-section'
import { ProblemsSection } from '@/components/landing/problems-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PendenciesSection } from '@/components/landing/pendencies-section'
import { RadarSection } from '@/components/landing/radar-section'
import { PlansSection } from '@/components/landing/plans-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FaqSection } from '@/components/landing/faq-section'
import { CtaSection } from '@/components/landing/cta-section'
import { LandingHeader } from '@/components/landing/landing-header'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingHeader />
      <main>
        <HeroSection />
        <BenefitsSection />
        <ProblemsSection />
        <FeaturesSection />
        <PendenciesSection />
        <RadarSection />
        <TestimonialsSection />
        <PlansSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
