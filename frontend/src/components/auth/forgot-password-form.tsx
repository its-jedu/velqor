"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

const RESEND_SECONDS = 30

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Countdown for the "Resend" button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const sendLink = async () => {
    setIsLoading(true)
    try {
      await api.forgotPassword(email.trim())
      setSent(true)
      setCooldown(RESEND_SECONDS)
      toast.success("Reset link sent", {
        description: `Check ${email.trim()} for the link.`,
      })
    } catch (err: unknown) {
      toast.error("Could not send reset link", {
        description: err instanceof Error ? err.message : "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendLink()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-primary/20 bg-linear-to-br from-card/50 to-card backdrop-blur-sm">
        {sent ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center">
                  <MailCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Check your email
              </CardTitle>
              <CardDescription>
                If an account exists for{" "}
                <span className="font-semibold text-foreground">{email.trim()}</span>, we&apos;ve sent
                a link to reset your password. It may take a minute, and don&apos;t forget to check
                your spam folder.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading || cooldown > 0}
                onClick={() => void sendLink()}
              >
                {isLoading
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend link in ${cooldown}s`
                    : "Resend link"}
              </Button>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full text-center text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </CardContent>

            <CardFooter>
              <Link
                href="/login"
                className="mx-auto flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-linear-to-r from-primary to-purple-600 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Forgot password?
              </CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className=" "
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </motion.div>
  )
}