'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { onUserChange } from '@/firebase/authClient'
import { db } from '@/firebase/config'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import Lottie from 'lottie-react'
import loadingReindeer from '@components/assets/reindeer.json'

interface Props {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dataPrefetched, setDataPrefetched] = useState(false)

  useEffect(() => {
    let prefetchTimer: NodeJS.Timeout
    let unsubscribe: (() => void) | null = null

    const prefetchData = async (userId: string) => {
      try {
        // Prefetch alle wichtigen Daten parallel
        await Promise.all([
          // User-Daten
          getDoc(doc(db, 'users', userId)),
          // Draws (für DrawPage)
          getDocs(collection(db, 'draws')),
          // Users (für ParticipantList)
          getDocs(collection(db, 'users')),
          // DrawnNames (für DrawPage)
          getDocs(collection(db, 'drawnNames'))
        ])
        setDataPrefetched(true)
      } catch (error) {
        console.error('Fehler beim Prefetchen:', error)
        setDataPrefetched(true) // Trotzdem weiter, auch wenn Prefetch fehlschlägt
      }
    }

    unsubscribe = onUserChange((user) => {
      if (!user) {
        router.push('/login')
        return
      }

      // Starte Prefetching sofort
      prefetchData(user.uid)

      // 500ms Verzögerung mit Prefetching
      prefetchTimer = setTimeout(() => {
        setLoading(false)
      }, 500)
    })

    return () => {
      if (prefetchTimer) clearTimeout(prefetchTimer)
      if (unsubscribe) unsubscribe()
    }
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
