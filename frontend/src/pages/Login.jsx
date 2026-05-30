import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { authAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 relative overflow-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full" />
      </div>

      {/* LOGIN CARD */}
      <Card className="w-full max-w-md relative border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl">

        <CardHeader className="text-center space-y-3 pb-2">

          {/* LOGO */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Printer className="h-7 w-7 text-white" />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight">
            PrintFlow
          </CardTitle>

          <CardDescription className="text-white/50">
            Smart 3D Printer Management System
          </CardDescription>

        </CardHeader>

        <CardContent>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-90 transition font-semibold rounded-xl"
            >
              {loading ? 'Signing in...' : isRegister ? 'Create Account' : 'Sign In'}
            </Button>

          </form>

          {/* TOGGLE */}
          <div className="mt-5 text-center text-sm text-white/50">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}

            <button
              className="text-violet-400 hover:text-violet-300 font-medium"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </div>

        </CardContent>

      </Card>
    </div>
  )
}