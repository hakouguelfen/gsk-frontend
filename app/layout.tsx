import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FirebaseProvider } from "@/lib/firebase/firebase-provider"
import { FirebaseInitializer } from "@/components/firebase-initializer"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pharmaceutical QC System",
  description: "A role-based quality control system for pharmaceutical manufacturing",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <FirebaseInitializer>
            <FirebaseProvider>{children}</FirebaseProvider>
          </FirebaseInitializer>
        </ThemeProvider>
      </body>
    </html>
  )
}
