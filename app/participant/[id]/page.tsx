'use client'

import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import ProtectedRoute from '@auth/ProtectedRoute'
import BottomNav from '@components/BottomNav'
import GlowTitle from '@components/GlowTitle'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { auth } from '@/firebase/authClient'

interface PageProps {
  params: Promise<{ id: string }>
}

interface WishItem {
  text: string
  link?: string
  imageUrl?: string
}

export default function UserWishlist(props: PageProps) {
  const { id } = use(props.params)
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishItem[]>([])
  const [reservations, setReservations] = useState<Record<string, string | null>>({})
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUid, setCurrentUid] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUid(user?.uid || null)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRef = doc(db, 'users', id)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          setUserName(null)
          setWishlist([])
          return
        }
        setUserName(userSnap.data().name || 'User')

        const wishlistRef = doc(db, 'wishlist', id)
        const wsSnap = await getDoc(wishlistRef)
        const items = wsSnap.exists() ? wsSnap.data().items || [] : []
        setWishlist(items.map((i: any) => (typeof i === 'string' ? { text: i } : i)))

        const resRef = doc(db, 'reservations', id)
        const resSnap = await getDoc(resRef)
        setReservations(resSnap.exists() ? resSnap.data().items || {} : {})
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const toggleReservation = async (index: number) => {
    if (!currentUid) return
    const resRef = doc(db, 'reservations', id)
    const currentValue = reservations[index]
    const newValue = currentValue === currentUid ? null : currentUid
    await setDoc(
      resRef,
      { items: { ...reservations, [index]: newValue } },
      { merge: true }
    )
    setReservations(prev => ({ ...prev, [index]: newValue }))
  }

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>
  if (!userName) return <p className='text-center mt-4 text-white'>404 – User nicht gefunden</p>

  return (
    <ProtectedRoute>
      <div className='font-sans min-h-screen flex flex-col relative'>
        <main className="flex-1 mt-24 px-6 sm:px-20 pb-40 flex flex-col gap-10 items-center z-10 min-h-[100vh]">
          <GlowTitle text={`${userName}’s Wünsche`} size='text-5xl sm:text-4xl' />

          <div className='flex flex-col gap-4 w-full max-w-md mt-4'>
            {wishlist.length === 0 ? (
              <p className="text-white/70 text-lg mt-4 text-center max-w-xs italic">
                Noch keine Wünsche✨
              </p>
            ) : (
              wishlist.map((item, index) => (
                <WishCard
                  key={index}
                  item={item}
                  index={index}
                  reservedBy={reservations[index] || null}
                  currentUid={currentUid}
                  onToggle={() => toggleReservation(index)}
                />
              ))
            )}
          </div>

          <button
            onClick={() => router.push('/participant')}
            className='mt-6 bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 active:scale-95 transition-transform font-medium'
          >
            &larr; Zurück zur Teilnehmerliste
          </button>
        </main>

        <div className='fixed bottom-0 left-0 right-0 z-50'>
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}

interface WishCardProps {
  item: WishItem
  index: number
  reservedBy: string | null
  currentUid: string | null
  onToggle: () => void
}

function WishCard({ item, reservedBy, currentUid, onToggle }: WishCardProps) {
  const isMine = reservedBy === currentUid
  const taken = !!reservedBy && !isMine

  let buttonText = 'Reservieren'
  if (isMine) buttonText = 'Reserviert'
  else if (taken) buttonText = 'Bereits reserviert'

  return (
    <motion.div
      className='relative flex flex-col gap-2 w-full p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-red-900/20 backdrop-blur-lg'
      style={{
        borderColor: isMine ? '#00FF88' : taken ? '#FF4444' : '#FFD700',
        boxShadow: isMine
          ? '0 0 15px 5px rgba(0,255,136,0.6), 0 0 20px 5px rgba(255,215,0,0.5)'
          : '0 0 15px 5px rgba(255,0,0,0.6), 0 0 20px 5px rgba(255,215,0,0.5)',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Reservierungsbutton unten rechts */}
      <button
        onClick={onToggle}
        className='absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full bg-black/30 text-white hover:bg-black/50 transition'
        disabled={Boolean(taken && !isMine)}
      >
        {buttonText}
      </button>

      {/* Wunschtext */}
      <div className='text-left break-words max-w-full text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-yellow-200 to-red-400 font-semibold'>
        {item.text}
      </div>

      {/* Optionales Bild */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt='Wunschbild'
          className='rounded-xl w-full max-h-48 object-cover mt-2'
        />
      )}

      {/* Optionaler Link */}
      {item.link && (
        <a
          href={item.link}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-2 inline-flex items-center text-yellow-400 hover:text-yellow-200 text-sm font-medium'
        >
          Link <ArrowForwardIcon fontSize='small' className='ml-1' />
        </a>
      )}
    </motion.div>
  )
}
