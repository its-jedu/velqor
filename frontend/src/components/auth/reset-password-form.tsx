"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const uid = params.get("uid")
  const token = params.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uid || !token) return

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same.",
      })
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error("Password too short", {
        description: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
      })
      return
    }

    setIsLoading(true)
    try {
      await api.resetPassword(uid, token, password, confirmPassword)
      toast.success("Password reset", {
        description: "You can now log in with your new password.",
      })
      router.push("/login")
    } catch (err: unknown) {
      toast.error("Could not reset password", {
        description:
          err instanceof Error ? err.message : "The link may have expired. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Opened without ?uid=...&token=... in the URL
  if (!uid || !token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 bg-linear-to-br from-card/50 to-card backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Invalid reset link</CardTitle>
            <CardDescription>
              This link is incomplete or has expired. Request a new one to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-3">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                Request a new link
              </Button>
            </Link>
            <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-primary/20 bg-linear-to-br from-card/50 to-card backdrop-blur-sm">
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
            Reset password
          </CardTitle>
          <CardDescription>Choose a new password for your Velqor account.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="border-primary/20 focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-foreground/60">
                At least {MIN_PASSWORD_LENGTH} characters. Avoid common passwords.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-primary/20 focus:border-primary"
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
                  Resetting...
                </div>
              ) : (
                "Reset password"
              )}
            </Button>

            <p className="text-center text-sm text-foreground/60">
              Link not working?{" "}
              <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
                Request a new one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}