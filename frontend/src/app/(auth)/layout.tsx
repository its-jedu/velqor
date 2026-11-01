export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10">
      {children}
    </div>
  )
}