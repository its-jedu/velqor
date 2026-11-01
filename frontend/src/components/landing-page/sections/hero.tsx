"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowRight, Trophy } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay - Darker for better text readability */}
      <div className="absolute inset-0 z-0 h-full">
        <Image
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="eSports tournament background"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        {/* Darker overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-purple-600/40" />
      </div>

      {/* Animated Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-glow" style={{ animationDelay: "2s" }} />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-32 right-20 hidden lg:block"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Trophy className="w-16 h-16 text-yellow-500/40" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            Compete. Conquer.
            <br />
            Cash Out.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md"
        >
          Join tournaments, battle players, and win real money. The ultimate eSports platform for competitive gamers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-lg px-8 py-6 group text-white font-semibold"
          >
            Join Tournament
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white border-white/30"
          >
            Learn More
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/20"
        >
          {[
            { label: "Active Players", value: "50K+" },
            { label: "Prize Pool", value: "₦950M+" },
            { label: "Tournaments", value: "1,000+" },
            { label: "Games", value: "25+" },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}