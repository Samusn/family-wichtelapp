'use client'

import { useEffect, useState } from 'react'
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import Confetti from 'react-confetti'

import treeAnim from '@components/assets/tree.json'
import giftBoxAnim from '@components/assets/giftBox.json'

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

  // 👤 Aktueller User & bisherigen Zug
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

  // 👥 Teilnehmer laden
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

  // 🎁 Los ziehen
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

    let iterations = 10
    let random: UserData | null = null
    const interval = setInterval(() => {
      random = available[Math.floor(Math.random() * available.length)]
      iterations--
      if (iterations <= 0) {
        clearInterval(interval)
        setDrawn(random!.name)
        saveDraw(currentUserId, random!.name)
        setShowPopup(true)
        setAnimating(false)

        setTimeout(() => setShowNameInPopup(true), 500)
      }
    }, 80)
  }

  // 💾 Speichern
  const saveDraw = async (userId: string, drawnName: string) => {
    const drawRef = doc(db, 'draws', userId)
    const drawSnap = await getDoc(drawRef)
    const drawnNames: string[] = drawSnap?.data()?.drawnNames || []
    const newDrawnNames = [...drawnNames, drawnName]
    await setDoc(drawRef, { drawnNames: newDrawnNames }, { merge: true })
  }

  // 🔄 Replay wenn Name-Rahmen geklickt wird
  const handleReplay = () => {
    if (!drawn) return
    setShowPopup(true)
    setShowNameInPopup(false)
    setTimeout(() => setShowNameInPopup(true), 300)
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[400px] gap-6">
      {/* 🎄 Baum */}
      <div className="w-60 h-60">
        <Lottie animationData={treeAnim} loop />
      </div>

      {/* 🎁 Zieh-Button */}
      {!drawn && !animating && (
        <motion.button
          onClick={handleDraw}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-[0_0_15px_#3ce35f] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Los ziehen 🎁
        </motion.button>
      )}

      {/* ✅ Name-Rahmen unter dem Baum */}
      {drawn && (
        <motion.div
          onClick={handleReplay}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="cursor-pointer px-6 py-3 border-2 border-green-500 rounded-2xl bg-white/10 backdrop-blur-md text-green-300 text-xl font-bold mt-4 shadow-[0_0_15px_#1cff87] hover:shadow-[0_0_25px_#1cff87] transition-shadow"
        >
          🎁 Du beschenkst: <span className="text-yellow-300">{drawn}</span>
        </motion.div>
      )}

      {loading && (
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
          Lade Teilnehmer...
        </p>
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
              {/* Geschenk Animation */}
              <div className="w-56 h-56">
                <Lottie animationData={giftBoxAnim} loop={false} />
              </div>

              {/* Name springt heraus */}
              <AnimatePresence>
                {showNameInPopup && (
                  <motion.div
                    key="name"
                    initial={{ y: 0, opacity: 0, scale: 0.5 }}
                    animate={{ y: -140, opacity: 1, scale: 1.2 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute bottom-24 text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_#ffd700]"
                  >
                    {drawn}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Schließen Button */}
              <button
                onClick={() => {
                  setShowPopup(false)
                  setShowNameInPopup(false)
                }}
                className="mt-10 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                Schließen
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
