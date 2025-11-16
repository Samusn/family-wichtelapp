'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/firebase/auth'
import { Dialog } from '@headlessui/react'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    try {
      await login(email, password)
      router.push('/home')
    } catch (err) {
      setError('Login fehlgeschlagen')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 w-full">

      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Titel */}
        <h1 className="text-4xl font-bold text-red-500 drop-shadow-[0_0_12px_#ff5555] text-center">
          Willkommen
        </h1>

        {/* Login Box */}
        <div className="w-full backdrop-blur-md bg-white/10 border border-red-400 p-8 rounded-2xl shadow-[0_0_18px_#ff3333] flex flex-col gap-6">

          {error && (
            <p className="text-red-300 text-center text-sm">{error}</p>
          )}

          {/* E-Mail */}
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/20 border border-red-400 placeholder-red-300 text-white focus:outline-none focus:ring-2 focus:ring-red-300 text-base"
          />

          {/* Passwort mit Toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-14 rounded-xl bg-white/20 border border-red-400 placeholder-red-300 text-white focus:outline-none focus:ring-2 focus:ring-red-300 text-base"
            />

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-red-200 hover:text-red-100 active:scale-95 p-2"
            >
              {showPassword ? (
                <VisibilityOffIcon fontSize="medium" />
              ) : (
                <VisibilityIcon fontSize="medium" />
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="mt-2 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold text-lg shadow-[0_0_15px_#ff3333] hover:scale-[1.04] transition active:scale-[0.97]"
          >
            Login
          </button>

          {/* Passwort vergessen */}
          <button
            onClick={() => setOpen(true)}
            className="text-red-300 hover:text-red-200 underline text-sm mx-auto mt-2 py-2"
          >
            Passwort vergessen?
          </button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center px-4">
          <Dialog.Panel className="bg-red-900 p-6 rounded-2xl shadow-lg max-w-sm w-full text-white border border-red-400">
            <Dialog.Title className="text-xl font-bold mb-3 text-yellow-200">
              Passwort vergessen?
            </Dialog.Title>

            <p className="text-red-100 mb-6 text-sm leading-relaxed">
              Bitte wende dich direkt an Samuel ;)
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-semibold text-sm active:scale-[0.96]"
              >
                OK
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
