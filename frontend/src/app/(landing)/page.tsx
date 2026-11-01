"use client"

import Hero from "@/components/landing-page/sections/hero"
import Features from "@/components/landing-page/sections/features"
import HowItWorks from "@/components/landing-page/sections/how-it-works"
import TournamentPreview from "@/components/landing-page/sections/tournament-preview"
import CTA from "@/components/landing-page/sections/cta"

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <TournamentPreview />
      <CTA />
    </>
  )
}