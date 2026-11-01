import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Trophy, Sword } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute -top-8 -right-8 animate-bounce">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <div className="absolute -bottom-8 -left-8 animate-bounce delay-150">
            <Sword className="w-12 h-12 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-4">
          Page Not Found
        </h2>

        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
          Oops! It seems you've wandered into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}