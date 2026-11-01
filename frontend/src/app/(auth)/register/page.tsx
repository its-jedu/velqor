import RegisterForm from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-600/10 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  )
}