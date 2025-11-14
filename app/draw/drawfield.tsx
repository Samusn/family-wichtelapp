'use client'

import { useEffect, useState, useRef } from 'react'
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import Confetti from 'react-confetti'

import giftHouseAnim from '@components/assets/gift_house.json'
import giftBoxAnim from '@components/assets/giftBox.json'
import fireplaceAnim from '@components/assets/fireplace.json'

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
  const [animating, setAnimating] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showNameInPopup, setShowNameInPopup] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const houseRef = useRef<LottieRefCurrentProps>(null)

  // Aktueller User & bisher gezogene Person laden
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        const drawRef = doc(db, 'draws', user.uid)
        const drawSnap = await getDoc(drawRef)
        if (drawSnap.exists()) {
          const drawnNames: string[] = drawSnap.data().drawnNames || []
          const lastDrawn = drawnNames[drawnNames.length - 1] || null
          setDrawn(lastDrawn)
          if (lastDrawn) setShowFinal(true)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // Teilnehmer laden
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

  // Speichern
  const saveDraw = async (userId: string, drawnName: string) => {
    const drawRef = doc(db, 'draws', userId)
    const drawSnap = await getDoc(drawRef)
    const drawnNames: string[] = drawSnap?.data()?.drawnNames || []
    const newDrawnNames = [...drawnNames, drawnName]
    await setDoc(drawRef, { drawnNames: newDrawnNames }, { merge: true })
  }

  // Ziehen
  const handleDraw = async () => {
    if (!currentUserId || animating || drawn) return

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
    const random = available[Math.floor(Math.random() * available.length)]

    // Haus Lottie abspielen
    houseRef.current?.play()

    // Nach 2 Sekunden Geschenk Popup mit Name
    setTimeout(async () => {
      setDrawn(random.name)
      await saveDraw(currentUserId, random.name)
      setShowPopup(true)
      setAnimating(false)

      // Name direkt beim Pop-up anzeigen
      setTimeout(() => setShowNameInPopup(true), 100)
    }, 3500)
  }

  // Replay
  const handleReplay = () => {
    if (!drawn) return
    setShowPopup(true)
    setShowNameInPopup(false)
    setTimeout(() => setShowNameInPopup(true), 100)
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full px-4 sm:px-10 gap-6">

      {/* 🎁 Los ziehen Button */}
      {!drawn && !animating && !loading && (
        <motion.button
          onClick={handleDraw}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-[0_0_15px_#3ce35f] hover:scale-105 active:scale-95 transition-transform"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Los ziehen 🎁
        </motion.button>
      )}

      {/* Haus Lottie */}
      {!drawn && (
        <div className="w-full max-w-[95%] mt-6 flex justify-center">
          <Lottie
            lottieRef={houseRef}
            animationData={giftHouseAnim}
            loop={false}
            autoplay={false}
          />
        </div>
      )}

      {/* 🎁 Popup */}
      <AnimatePresence>
        {showPopup && drawn && (
          <motion.div
            key="popup"
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Confetti numberOfPieces={180} gravity={0.3} recycle={false} />
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="w-56 h-56">
                <Lottie animationData={giftBoxAnim} loop={false} />
              </div>

              <AnimatePresence>
                {showNameInPopup && (
                  <motion.div
                    key="name"
                    initial={{ y: 0, opacity: 0, scale: 0.5 }}
                    animate={{ y: -140, opacity: 1, scale: 1.2 }}
                    exit={{ y: 0, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute bottom-24 text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_#ffd700] text-center"
                  >
                    {drawn}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => {
                  setShowPopup(false)
                  setShowNameInPopup(false)
                  setShowFinal(true)
                }}
                className="mt-10 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                Schließen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fireplace & finale Anzeige */}
      {drawn && showFinal && (
        <div className="w-full flex flex-col items-center mt-6">
          <motion.div
            key="final-name"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center text-3xl sm:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_#ffd700] p-3 border-2 border-yellow-400 rounded-xl bg-black/20 mb-4"
          >
            🎁 {drawn}
          </motion.div>

          <div className="w-64 h-64 sm:w-80 sm:h-80">
            <Lottie animationData={fireplaceAnim} loop />
          </div>
        </div>
      )}
    </div>
  )
}
