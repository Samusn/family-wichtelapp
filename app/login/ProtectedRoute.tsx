'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { onUserChange } from '@/firebase/auth'
import Loader from '@components/Loading'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onUserChange((user) => {
      if (!user) router.push('/login')
      else setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  if (loading)
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-black/30 z-50'>
        <Loader />
      </div>
    )

  return <>{children}</>
}
