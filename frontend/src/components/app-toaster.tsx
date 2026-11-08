"use client"

import { Toaster } from "sonner"
import { useTheme } from "next-themes"

export function AppToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={(theme as "light" | "dark" | "system") ?? "system"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ duration: 4000 }}
    />
  )
}