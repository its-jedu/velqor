import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatNaira, winners } from "@/components/landing-page/data"

export default function Winners() {
  return (
    <section className="bg-muted/40 py-20 lg:py-28">
      <div className="container mx-auto grid gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Players are getting paid</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Here are some of the latest tournament winners. Your name could be next on the list.
          </p>
        </div>

        <Card className="gap-0 divide-y py-0">
          {winners.map((w) => (
            <div key={w.name + w.when} className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>{w.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{w.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {w.tournament} · {w.when}
                </p>
              </div>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {w.game}
              </Badge>
              <p className="font-semibold text-primary">{formatNaira(w.prize)}</p>
            </div>
          ))}
        </Card>
      </div>
    </section>
  )
}