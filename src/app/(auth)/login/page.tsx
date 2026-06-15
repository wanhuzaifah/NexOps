'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    toast.success('Login berjaya!')
    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-brand-navy-light rounded-xl border border-slate-700 p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
          <span className="text-brand-navy font-bold text-sm">FG</span>
        </div>
        <h1 className="text-white text-2xl font-bold">NexOps</h1>
      </div>
      <p className="text-slate-400 text-sm mb-1">FAZMI GROUP SDN BHD</p>
      <p className="text-slate-600 text-xs mb-6 flex items-center gap-1">
        <Shield size={11} /> Sistem dalaman — akses terhad
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            Emel
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@fginspections.com"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            Kata Laluan
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full gold-gradient text-brand-navy font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Log Masuk
            </>
          )}
        </button>
      </form>

      <p className="text-slate-600 text-xs text-center mt-6">
        FG Inspection · Sistem Operasi Dalaman
      </p>
    </div>
  )
}
