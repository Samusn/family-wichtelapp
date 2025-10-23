'use client'

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import ProtectedRoute from '@auth/ProtectedRoute'
import BottomNav from '@components/BottomNav'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import GlowTitle from '@components/GlowTitle'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function UserWishlist(props: PageProps) {
  const { id } = use(props.params)
  const router = useRouter()
  const [wishlist, setWishlist] = useState<string[]>([])
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
        setWishlist(wishlistSnap.exists() ? wishlistSnap.data().items || [] : [])
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

  return (
    <ProtectedRoute>
      <div className='font-sans min-h-screen flex flex-col relative'>
        <main className='flex-1 mt-20 mb-20 px-4 sm:px-6 md:px-10 flex flex-col gap-8 items-center justify-start w-full'>
          {loading ? (
            <p className='text-center text-gray-400 w-full mt-20'>Lädt...</p>
          ) : (
            <>
              <GlowTitle
                text={`${userName}’s Wünsche`}
                size='text-2xl sm:text-3xl'
                color='#00a000'
                shadowColor='#99ff66'
              />

              {wishlist.length === 0 ? (
                <p className='text-white italic mt-4 text-center w-full'>
                  Noch keine Wünsche vorhanden ✨
                </p>
              ) : (
                <ul className='w-full max-w-md bg-white/90 rounded-2xl shadow-lg divide-y divide-gray-200 p-4 mt-4'>
                  {wishlist.map((item, i) => (
                    <li
                      key={i}
                      className='flex items-center p-3 hover:bg-green-50 rounded-xl transition cursor-pointer'
                    >
                      <CardGiftcardIcon className='text-red-600 w-5 h-5 mr-3' />
                      <span className='text-gray-900 font-medium truncate'>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => router.push('/participant')}
                className='mt-6 bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 active:scale-95 transition-transform font-medium'
              >
                &larr; Zurück zur Teilnehmerliste
              </button>
            </>
          )}
        </main>

        <div className='fixed bottom-0 left-0 right-0 z-50'>
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}
