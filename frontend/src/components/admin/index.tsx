"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, DollarSign, Activity } from "lucide-react"

export default function Admin() {
  const stats = [
    {
      title: "Total Users",
      value: "12,345",
      change: "+15%",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Tournaments",
      value: "24",
      change: "+3",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Total Volume",
      value: "₦45.2M",
      change: "+22%",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Players",
      value: "8,234",
      change: "+8%",
      icon: Activity,
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10 pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-foreground/60 mt-2">
              Manage users, tournaments, and platform settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-primary/20 bg-gradient-to-br from-card/50 to-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} p-1.5`}>
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-500 mt-1">{stat.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                      <div>
                        <p className="font-semibold">Gamer{i}</p>
                        <p className="text-sm text-foreground/60">gamer{i}@example.com</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Active Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                      <div>
                        <p className="font-semibold">Tournament #{i}</p>
                        <p className="text-sm text-foreground/60">128 players • ₦500k prize</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                        In Progress
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}