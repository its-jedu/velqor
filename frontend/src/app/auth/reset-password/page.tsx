import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export const metadata = {
  title: "Reset password | Velqor",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-primary/5 to-purple-600/10 px-4 py-12">
      <Suspense
        fallback={
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}