'use client'

import { useEffect, useState } from 'react'
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import GlowTitle from '@components/GlowTitle'
import Confetti from 'react-confetti'

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function DrawField() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawn, setDrawn] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        const drawRef = doc(db, 'draws', user.uid)
        const drawSnap = await getDoc(drawRef)
        if (drawSnap.exists()) {
          const drawnNames: string[] = drawSnap.data().drawnNames || []
          setDrawn(drawnNames[drawnNames.length - 1] || null)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        const users = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as UserData) }))
          .filter((u) => u.role === 'user')
        setParticipants(users)
      } catch (error) {
        console.error('Fehler beim Laden der Teilnehmer:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchParticipants()
  }, [])

  const handleDraw = async () => {
    if (!currentUserId || animating) return

    const drawRef = doc(db, 'draws', currentUserId)
    const drawSnap = await getDoc(drawRef)
    const alreadyDrawn: string[] = drawSnap?.data()?.drawnNames || []

    const available = participants
      .filter((p) => p.id !== currentUserId)
      .filter((p) => !alreadyDrawn.includes(p.name))

    if (available.length === 0) {
      alert('Alle Teilnehmer wurden bereits gezogen. Wende dich an Samuel 😅')
      return
    }

    setAnimating(true)
    setDrawn(null)

    let iterations = 25
    let random: UserData | null = null

    const interval = setInterval(() => {
      random = available[Math.floor(Math.random() * available.length)]
      setHighlight(random.name)
      iterations--

      if (iterations <= 0) {
        clearInterval(interval)
        setHighlight(null)
        setAnimating(false)
        setDrawn(random!.name)
        setShowPopup(true)
        saveDraw(currentUserId, random!.name)
      }
    }, 100)
  }

  const saveDraw = async (userId: string, drawnName: string) => {
    const drawRef = doc(db, 'draws', userId)
    const drawSnap = await getDoc(drawRef)
    const drawnNames: string[] = drawSnap?.data()?.drawnNames || []
    const newDrawnNames = [...drawnNames, drawnName]
    await setDoc(drawRef, { drawnNames: newDrawnNames }, { merge: true })
  }

  return (
    <div className='flex justify-center items-center w-full mt-6 min-h-[400px]'>
      <div className='w-full max-w-sm bg-white/80 rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 z-10'>
        <GlowTitle
          text='Los ziehen'
          size='text-2xl'
          color='#00a000'
          shadowColor='#99ff66'
        />

        {loading ? (
          <p className='text-gray-500 text-sm'>Lade Teilnehmer...</p>
        ) : !drawn ? (
          <>
            <motion.div
              className='w-full h-32 flex items-center justify-center border-2 border-green-500 rounded-2xl text-gray-900 text-lg font-semibold'
              animate={{ scale: highlight ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.2 }}
            >
              {highlight || '---'}
            </motion.div>

            <button
              onClick={handleDraw}
              disabled={animating}
              className='mt-6 flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-md hover:bg-green-700 active:scale-95 transition-transform font-bold text-lg disabled:opacity-50'
            >
              Ziehen
            </button>
          </>
        ) : (
          <div
            className='mt-6 flex flex-col items-center gap-4 cursor-pointer'
            onClick={() => setShowPopup(true)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className='text-4xl font-extrabold text-green-600'
            >
              {drawn}
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPopup && drawn && (
          <>
            <motion.div
              className='absolute inset-0 flex items-center justify-center z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Confetti
                numberOfPieces={200}
                gravity={0.2}
                recycle={false}
                width={400}
                height={400}
              />
              <motion.div
                className='bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-4 w-72'
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className='text-4xl font-extrabold text-green-600'
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  {drawn}
                </motion.div>
                <button
                  onClick={() => setShowPopup(false)}
                  className='mt-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700'
                >
                  Schließen
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
