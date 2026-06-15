'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Search,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Bot,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/',        icon: LayoutDashboard },
  { label: 'Tender Scout', href: '/tenders', icon: Search },
  { label: 'Market Intel', href: '/market',  icon: BarChart2 },
  { label: 'Tetapan',      href: '/settings', icon: Settings },
]

const supabase = createClient()

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('Wan')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile?.full_name) setUserName(profile.full_name)
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Log keluar berjaya')
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const currentPage = NAV_ITEMS.find((n) => isActive(n.href))?.label || 'NexOps'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-brand-navy" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-none">NexOps</p>
            <p className="text-brand-gold text-xs leading-none mt-0.5">AI Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  active
                    ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${active ? 'text-brand-gold' : 'text-slate-400 group-hover:text-white'}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom — user + logout */}
      <div className="border-t border-slate-700 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-brand-navy text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-slate-500 text-xs">Admin</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Log Keluar' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm">Log Keluar</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-brand-navy border-r border-slate-700/60 transition-all duration-300 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-52 bg-brand-navy border-r border-slate-700">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
            <Menu size={20} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div className="flex-1">
            <h1 className="text-slate-800 dark:text-white font-semibold text-sm">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-brand-gold text-xs font-medium">DeepSeek V4</span>
          </div>
          <button className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <Bell size={18} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
