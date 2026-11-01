"use client"

import { motion } from "framer-motion"
import { Trophy, DollarSign, Target, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Trophy,
    title: "Competitive Tournaments",
    description: "Join high-stakes tournaments with professional brackets and real-time leaderboards.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: DollarSign,
    title: "Real Money Rewards",
    description: "Win real cash prizes and instant withdrawals to your preferred payment method.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Target,
    title: "Fair Matchmaking",
    description: "Advanced skill-based matchmaking ensures you face opponents at your level.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure Wallet",
    description: "Bank-grade security with two-factor authentication for your funds.",
    color: "from-purple-500 to-pink-500",
  },
]

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Why Choose Velqor?
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Experience the future of competitive gaming with our cutting-edge platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full bg-gradient-to-br from-card/50 to-card border-primary/20 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} p-3 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}