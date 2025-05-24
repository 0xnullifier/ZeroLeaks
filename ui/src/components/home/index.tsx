import { Background } from "./background"
import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { FeaturedLeaksSection } from "./featured-leaks-section"
import { HowItWorksSection } from "./how-it-works-section"
import { CallToActionSection } from "./call-to-action-section"
import { FooterSection } from "./footer-section"

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Background />
      <HeroSection />
      <FeaturesSection />
      <FeaturedLeaksSection />
      <HowItWorksSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  )
}

// Export individual components for flexibility
export { Background } from "./background"
export { HeroSection } from "./hero-section"
export { FeaturesSection } from "./features-section"
export { FeaturedLeaksSection } from "./featured-leaks-section"
export { HowItWorksSection } from "./how-it-works-section"
export { CallToActionSection } from "./call-to-action-section"
export { FooterSection } from "./footer-section" 