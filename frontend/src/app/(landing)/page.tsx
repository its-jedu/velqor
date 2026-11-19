import Hero from "@/components/landing-page/sections/hero"
import Games from "@/components/landing-page/sections/games"
import TournamentPreview from "@/components/landing-page/sections/tournament-preview"
import HowItWorks from "@/components/landing-page/sections/how-it-works"
import Winners from "@/components/landing-page/sections/winners"
import FAQ from "@/components/landing-page/sections/faq"
import CTA from "@/components/landing-page/sections/cta"

export default function Home() {
  return (
    <>
      <Hero />
      <Games />
      <TournamentPreview />
      <HowItWorks />
      <Winners />
      <FAQ />
      <CTA />
    </>
  )
}