'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { onUserChange } from '@/firebase/authClient'
import Lottie from 'lottie-react'
import loadingReindeer from '@components/assets/reindeer.json'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verzögerung einbauen
    const timer = setTimeout(() => {
      const unsubscribe = onUserChange((user) => {
        if (!user) router.push('/login')
        else setLoading(false)
      })
      // Cleanup
      return () => unsubscribe()
    }, 500) // 2 Sekunden Verzögerung

    return () => clearTimeout(timer)
  }, [router])

  if (loading)
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-black/30 z-50'>
        <div className="w-40 h-40">
          <Lottie animationData={loadingReindeer} loop />
        </div>
      </div>
    )

  return <>{children}</>
}
