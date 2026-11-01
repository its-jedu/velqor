"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Zap, ShoppingBag } from 'lucide-react'

const ads = [
  {
    icon: Gift,
    title: "Weekly Bonus",
    description: "Deposit ₦10,000 and get ₦2,000 free!",
    buttonText: "Claim Now",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    title: "Premium Pass",
    description: "Unlock exclusive tournaments with 2x rewards",
    buttonText: "Upgrade Now",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: ShoppingBag,
    title: "Gaming Gear Sale",
    description: "Up to 40% off on gaming accessories",
    buttonText: "Shop Now",
    color: "from-blue-500 to-cyan-500",
  },
]

export function ProductAds() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ads.map((ad, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-r ${ad.color} border-0 cursor-pointer hover:scale-105 transition-transform duration-300`}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <ad.icon className="w-8 h-8 text-white" />
              <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
            </div>
            <p className="text-white/90 text-sm mb-3">{ad.description}</p>
            <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
              {ad.buttonText}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}