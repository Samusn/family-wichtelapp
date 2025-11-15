'use client'

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import ProtectedRoute from '@auth/ProtectedRoute'
import BottomNav from '@components/BottomNav'
import GlowTitle from '@components/GlowTitle'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

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
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userRef = doc(db, 'users', id)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          setUserName('Unbekannter User')
          setWishlist([])
          return
        }
        const userData = userSnap.data()
        setUserName(userData.name || 'User')

        const wishlistRef = doc(db, 'wishlist', id)
        const wishlistSnap = await getDoc(wishlistRef)
        const itemsData = wishlistSnap.exists() ? wishlistSnap.data().items || [] : []

        const normalized: WishItem[] = itemsData.map((i: any) =>
          typeof i === 'string' ? { text: i } : i
        )
        setWishlist(normalized)
      } catch (err) {
        console.error('Fehler beim Laden der Wishlist:', err)
        setUserName('Unbekannter User')
        setWishlist([])
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [id])

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>

  return (
    <ProtectedRoute>
      <div className='font-sans min-h-screen flex flex-col relative'>
        <main className="flex-1 mt-24 px-6 sm:px-20 pb-40 flex flex-col gap-10 items-center z-10 min-h-[100vh]">
          <GlowTitle
            text={`${userName}’s Wünsche`}
            size='text-3xl sm:text-4xl'
            color='#00ff66'
            shadowColor='#33ff99'
          />

          {wishlist.length === 0 ? (
            <p className='text-white italic mt-4 text-center w-full'>
              Noch keine Wünsche vorhanden ✨
            </p>
          ) : (
            <div className='flex flex-col gap-4 w-full max-w-md mt-4'>
              {wishlist.map((item, index) => (
                <WishCard key={index} item={item} />
              ))}
            </div>
          )}

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
}

function WishCard({ item }: WishCardProps) {
  return (
    <motion.div
      className='relative flex flex-col gap-2 w-full p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden bg-red-900/20 backdrop-blur-lg'
      style={{
        borderColor: '#FFD700',
        boxShadow: '0 0 15px 5px rgba(255,0,0,0.6), 0 0 20px 5px rgba(255,215,0,0.5)',
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 25px 5px rgba(255,215,0,0.7)' }}
    >
      {/* Wunschtext oben */}
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

      {/* Link unten mit Pfeil */}
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
