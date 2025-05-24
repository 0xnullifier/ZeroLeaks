import {
  Background,
  HeroSection,
  FeaturesSection,
  FeaturedLeaksSection,
  HowItWorksSection,
  CallToActionSection,
  FooterSection,
} from "@/components/home"

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