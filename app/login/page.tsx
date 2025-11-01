'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/firebase/auth'
import { Dialog } from '@headlessui/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className='min-h-screen flex items-center justify-center p-8 w-full'>
      <div className='w-full max-w-md flex flex-col items-center gap-6'>

        <h1 className='text-4xl font-bold text-red-500 drop-shadow-[0_0_12px_#ff5555]'>
          Willkommen
        </h1>

        <div className='w-full backdrop-blur-md bg-white/10 border border-red-400 p-8 rounded-2xl shadow-[0_0_18px_#ff3333] flex flex-col gap-5'>

          {error && <p className='text-red-300 text-center'>{error}</p>}

          <input
            type='email'
            placeholder='E-Mail'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='w-full p-3 rounded-xl bg-white/20 border border-red-400 placeholder-red-300 text-white focus:outline-none'
          />

          <input
            type='password'
            placeholder='Passwort'
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full p-3 rounded-xl bg-white/20 border border-red-400 placeholder-red-300 text-white focus:outline-none'
          />

          <button
            onClick={handleLogin}
            className='mt-2 w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white font-semibold shadow-[0_0_15px_#ff3333] hover:scale-[1.03] transition'
          >
            Login
          </button>

          <button
            onClick={() => setOpen(true)}
            className='text-red-300 hover:text-red-200 underline text-sm mx-auto mt-1'
          >
            Passwort vergessen?
          </button>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className='relative z-50'>
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4'>
          <Dialog.Panel className='bg-red-900 p-6 rounded-2xl shadow-lg max-w-sm w-full text-white border border-red-400'>
            <Dialog.Title className='text-xl font-bold mb-3'>Passwort vergessen?</Dialog.Title>
            <p className='text-red-100 mb-5'>
              Bitte wende dich direkt an Samuel ;)
            </p>
            <div className='flex justify-end'>
              <button
                onClick={() => setOpen(false)}
                className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold'
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
