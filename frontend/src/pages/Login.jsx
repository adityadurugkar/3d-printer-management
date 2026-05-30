import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Mail, Lock, UserIcon, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const fn = isRegister ? authAPI.register : authAPI.login
      const { data } = await fn(form)
      localStorage.setItem('user', JSON.stringify(data))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0b0b1a]">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glowing orbs */}
      <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full animate-pulse-soft" />
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />

      {/* Floating dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-violet-400/30 animate-float" />
      <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-400/25 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-violet-500/20 animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md relative animate-fade-in-up">
        {/* Decorative gradient border card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-violet-500/20 via-transparent to-transparent p-[1px]">
          <div className="rounded-2xl bg-[#0f0f24] backdrop-blur-2xl shadow-2xl shadow-violet-500/10 overflow-hidden">
            {/* Header */}
            <div className="text-center pt-10 pb-6 px-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mb-5 animate-bounce-in">
                <Printer className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">PrintFlow</h1>
              <p className="text-white/40 text-sm mt-2 font-medium">Smart 3D Printer Management System</p>
            </div>

            <div className="px-8 pb-10">
              {error && (
                <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <Input
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70 text-xs font-medium uppercase tracking-wider">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500/50 focus:ring-violet-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : isRegister ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/40 text-sm">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                    onClick={() => {
                      setIsRegister(!isRegister)
                      setError('')
                    }}
                  >
                    {isRegister ? 'Sign in' : 'Register'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-white/20 text-xs">
          © 2026 PrintFlow Enterprise. All rights reserved.
        </p>
      </div>
    </div>
  )
}
