"use client"

import { useRef, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, LogIn, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

type Status = "idle" | "loading" | "success"

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const formStagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

// Fixed values (no Math.random) so server and client render the same thing
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 2 + (i % 3),
  duration: 14 + (i % 5) * 4,
  delay: -((i * 5) % 20),
}))

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="login-orb-a absolute -left-32 -top-32 size-[28rem] rounded-full bg-primary/25 blur-3xl" />
      <div className="login-orb-b absolute -bottom-40 -right-24 size-[32rem] rounded-full bg-purple-600/20 blur-3xl" />
      <div className="login-orb-c absolute left-[40%] top-[30%] size-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="login-grid absolute inset-0" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="login-particle bg-primary/50"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [capsOn, setCapsOn] = useState(false)
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null)

  const shake = useAnimation()
  const wrapRef = useRef<HTMLDivElement>(null)

  // Subtle 3D tilt that follows the mouse
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 150, damping: 18 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mx.set(x / rect.width - 0.5)
    my.set(y / rect.height - 0.5)
    wrapRef.current?.style.setProperty("--mx", `${x}px`)
    wrapRef.current?.style.setProperty("--my", `${y}px`)
  }

  function handleMouseLeave() {
    mx.set(0)
    my.set(0)
  }

  const busy = status !== "idle"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setStatus("loading")

    try {
      const user = await login(formData.username.trim(), formData.password, "username")
      setStatus("success")
      toast.success("Welcome back!", { description: "You're now logged in." })
      router.push(user.role === "admin" ? "/admin" : "/players")
    } catch (err: unknown) {
      setStatus("idle")
      shake.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } })
      const message =
        err instanceof Error ? err.message : "Please check your credentials and try again."
      toast.error("Login failed", { description: message })
    }
  }

  return (
    <>
      <Backdrop />

      <motion.div
        ref={wrapRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="group/card relative z-10 w-full max-w-md rounded-2xl"
      >
        <motion.div animate={shake} className="relative rounded-2xl">
          <Card className="relative overflow-hidden rounded-2xl border-border bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            {/* Spotlight that follows the cursor */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgb(124 92 255 / 0.14), transparent 60%)",
              }}
            />

            <motion.div variants={container} initial="hidden" animate="show" className="relative">
              <CardHeader className="space-y-4 pb-2 text-center">
                <motion.div variants={item} className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-600 shadow-lg shadow-primary/30">
                      <LogIn className="size-8 text-white" />
                    </div>
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/40 blur-xl" />
                  </motion.div>
                </motion.div>

                <motion.div variants={item} className="space-y-1">
                  <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                  <CardDescription>Sign in to your Velqor account to continue competing</CardDescription>
                </motion.div>
              </CardHeader>

              <motion.form variants={formStagger} onSubmit={handleSubmit}>
                <CardContent className="space-y-5 pt-4">
                  {/* Username */}
                  <motion.div variants={item} className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <User
                        className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors duration-200 ${
                          focusedField === "username" ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <Input
                        id="username"
                        type="text"
                        placeholder="GamerTag2026"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={busy}
                        className="h-11 bg-background/50 pl-10 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/25"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Use your username, not your email.</p>
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={item} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary underline-offset-4 transition-colors hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock
                        className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors duration-200 ${
                          focusedField === "password" ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => {
                          setFocusedField(null)
                          setCapsOn(false)
                        }}
                        onKeyDown={(e) => setCapsOn(e.getModifierState("CapsLock"))}
                        onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
                        required
                        disabled={busy}
                        className="h-11 bg-background/50 pl-10 pr-11 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={busy}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {capsOn && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-1.5 overflow-hidden text-xs text-warning"
                        >
                          <AlertCircle className="size-3.5" />
                          Caps Lock is on
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Remember me */}
                  <motion.label variants={item} className="flex cursor-pointer select-none items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border bg-background text-primary focus:ring-primary/30 focus:ring-offset-0"
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </motion.label>
                </CardContent>

                <CardFooter className="flex flex-col gap-5 pt-2">
                  <motion.div variants={item} className="w-full">
                    <Button
                      type="submit"
                      disabled={busy || !formData.username || !formData.password}
                      className={`btn-shimmer h-11 w-full font-medium text-white shadow-lg transition-all duration-300 disabled:opacity-70 ${
                        status === "success"
                          ? "bg-success shadow-success/25 hover:bg-success"
                          : "bg-linear-to-r from-primary to-purple-600 shadow-primary/25 hover:from-primary/90 hover:to-purple-600/90"
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {status === "loading" ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="size-4 animate-spin" />
                            Signing in...
                          </motion.span>
                        ) : status === "success" ? (
                          <motion.span
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Check className="size-4" strokeWidth={3} />
                            Welcome back
                          </motion.span>
                        ) : (
                          <motion.span
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2"
                          >
                            <LogIn className="size-4" />
                            Sign In
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>

                  <motion.p variants={item} className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
                    >
                      Create an account
                    </Link>
                  </motion.p>
                </CardFooter>
              </motion.form>
            </motion.div>
          {/* </Card> */}
          </Card>

          {/* The two travelling white beams (on top of the card edge) */}
          <div aria-hidden className="beam-border beam-glow" />
          <div aria-hidden className="beam-border" />
        </motion.div>
      </motion.div>
    </>
  )
}