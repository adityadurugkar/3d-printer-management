import Sidebar from "./Sidebar"
import { useState } from "react"
import { Menu, Bell, User } from "lucide-react"

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* SIDEBAR */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/30 backdrop-blur-md">

          {/* LEFT - MENU */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden md:block text-sm text-white/60">
              3D Printer Management System
            </div>

          </div>

          {/* CENTER STATUS */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-white/60">System Online</span>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </div>

            {/* USER */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"></div>
              <span className="text-xs text-white/70">Admin</span>
            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">

          <div className="bg-white/5 border border-white/10 rounded-2xl min-h-full backdrop-blur-md p-6 max-w-7xl mx-auto">

            {children}

          </div>

        </main>

      </div>
    </div>
  )
}