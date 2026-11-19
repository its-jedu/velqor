import Link from "next/link"
import { Banknote, Gamepad2, Trophy, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  { icon: Wallet, title: "Create an account and fund your wallet", text: "Sign up, then add money to your naira wallet." },
  { icon: Trophy, title: "Pick a tournament", text: "Choose a game, check the entry fee and prize pool, and join." },
  { icon: Gamepad2, title: "Play your matches", text: "Win your games to move up the table or through the bracket." },
  { icon: Banknote, title: "Withdraw your winnings", text: "Prize money goes to your wallet. Withdraw it when you're ready." },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="container mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From sign-up to payout in four steps</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            It takes a couple of minutes to get started. After that, it&apos;s just you and your game.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/auth/register">Create free account</Link>
          </Button>
        </div>

        <ol className="relative space-y-10 border-l pl-8">
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="absolute -left-[3.25rem] flex h-10 w-10 items-center justify-center rounded-full border bg-background font-semibold">
                {i + 1}
              </span>
              <div className="flex items-start gap-4">
                <step.icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">{step.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}