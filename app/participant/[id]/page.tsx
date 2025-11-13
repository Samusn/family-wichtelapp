'use client'

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import ProtectedRoute from '@auth/ProtectedRoute'
import BottomNav from '@components/BottomNav'
import GlowTitle from '@components/GlowTitle'
import { useRouter } from 'next/navigation'
import { use } from 'react'

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

        // Alte Strings normalisieren
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
            size='text-2xl sm:text-3xl'
            color='#00a000'
            shadowColor='#99ff66'
          />

          {wishlist.length === 0 ? (
            <p className='text-white italic mt-4 text-center w-full'>
              Noch keine Wünsche vorhanden ✨
            </p>
          ) : (
            <div className='flex flex-col gap-4 w-full max-w-md mt-4'>
              {wishlist.map((item, index) => (
                <div
                  key={index}
                  className='flex flex-col gap-2 w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 border-2 border-green-500 shadow-[0_0_15px_#3ce35f] text-white font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#1cff87] transition-all duration-200 cursor-pointer'
                >
                  {/* Text + Link */}
                  <div className='flex justify-between items-center'>
                    <div className='flex-grow text-left break-words max-w-full'>
                      {item.link ? (
                        <a
                          href={item.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline text-white hover:text-green-400'
                        >
                          {item.text}
                        </a>
                      ) : (
                        item.text
                      )}
                    </div>
                  </div>

                  {/* Bild */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt='Wunschbild'
                      className='rounded-xl w-full max-h-48 object-cover mt-2'
                    />
                  )}
                </div>
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
