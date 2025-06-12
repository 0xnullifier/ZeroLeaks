import {
  HeroSection,
  FeaturesSection,
  FeaturedLeaksSection,
  HowItWorksSection,
  CallToActionSection,
  FooterSection,
} from "@/components/home"

export function HomePage() {
  return (
    <div className="min-h-screen text-foreground">
      <HeroSection />
      <FeaturesSection />
      <FeaturedLeaksSection />
      <HowItWorksSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  )
}