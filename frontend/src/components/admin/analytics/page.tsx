// src/app/admin/analytics/page.tsx  (placeholder until we build the real page)
import { BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          KPIs, charts, and how money moves in and out of the platform.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <BarChart3 className="size-10 text-muted-foreground" />
          <p className="font-medium">Analytics is coming next</p>
        </CardContent>
      </Card>
    </div>
  )
}