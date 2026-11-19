import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-primary/10 px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Your next win starts with one tournament
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create your account, fund your wallet and join a tournament in minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/auth/register">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}