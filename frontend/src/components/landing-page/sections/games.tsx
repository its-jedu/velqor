import Image from "next/image"
import Link from "next/link"
import { games, tournaments } from "@/components/landing-page/data"

export default function Games() {
  return (
    <section id="games" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Play the games you already know</h2>
          <p className="mt-3 text-muted-foreground">
            No new game to learn. Pick your game, find a tournament, and start playing.
          </p>
        </div>

        <div className="grid gap-4 lg:h-[34rem] lg:grid-cols-3 lg:grid-rows-2">
          {games.map((game, i) => {
            const open = tournaments.filter((t) => t.game === game.name && t.status !== "live").length
            return (
              <Link
                key={game.name}
                href="#tournaments"
                className={`group relative flex min-h-64 items-end overflow-hidden rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  i === 0 ? "lg:row-span-2" : ""
                }`}
              >
                <Image
                  src={game.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative p-6 text-white">
                  <h3 className="text-2xl font-semibold">{game.name}</h3>
                  <p className="mt-1 max-w-xs text-sm text-white/80">{game.tagline}</p>
                  <p className="mt-3 text-sm font-medium text-primary-foreground/90">
                    {open} tournament{open === 1 ? "" : "s"} open to join
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}