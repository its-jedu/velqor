"use client"

import { motion } from "framer-motion"
import { Wallet, Trophy, Sword, Wallet as Withdraw } from "lucide-react"

const steps = [
  {
    icon: Wallet,
    title: "Fund Your Wallet",
    description: "Add funds securely to your Velqor wallet and start competing",
    step: "01",
  },
  {
    icon: Trophy,
    title: "Join a Tournament",
    description: "Browse available tournaments and choose your battleground",
    step: "02",
  },
  {
    icon: Sword,
    title: "Compete in Matches",
    description: "Face off against players and climb the leaderboard",
    step: "03",
  },
  {
    icon: Withdraw,
    title: "Win and Withdraw",
    description: "Cash out your winnings instantly to your preferred method",
    step: "04",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-600/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Get started in four simple steps and start winning real money
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground/60 text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-purple-600/20" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}