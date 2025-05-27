import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import type React from "react" // Added import for React

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar role="driver" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}