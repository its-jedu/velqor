import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot password | Velqor",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-primary/5 to-purple-600/10 px-4 py-12">
      <ForgotPasswordForm />
    </div>
  )
}