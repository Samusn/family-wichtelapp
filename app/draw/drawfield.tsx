'use client'

import { useEffect, useState, useRef } from 'react'
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import Confetti from 'react-confetti'
import { IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import GlowButton from './glowButton'

import GlowTitle from '@components/GlowTitle'
import giftHouseAnim from '@components/assets/gift_house.json'
import giftBoxAnim from '@components/assets/giftBox.json'
import snowGlobeAnim from '@components/assets/schneekugel.json'

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
  const [visible, setVisible] = useState(false)
  const [isNewDraw, setIsNewDraw] = useState(false)

  const houseRef = useRef<LottieRefCurrentProps>(null)
  const scrollYRef = useRef(0)

  // Auth check & letzte Ziehung laden
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
          // Popup nicht automatisch öffnen
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

  // Scroll sperren bei Popup
  useEffect(() => {
    if (showPopup) {
      scrollYRef.current = window.scrollY
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollYRef.current}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollYRef.current)
    }
  }, [showPopup])

  // Atomare Speicherung der Ziehung
  const saveDraw = async (userId: string, drawnName: string) => {
    const drawRef = doc(db, 'draws', userId)
    const drawSnap = await getDoc(drawRef)
    const drawnNames: string[] = drawSnap?.data()?.drawnNames || []
    if (!drawnNames.includes(drawnName)) {
      const newDrawnNames = [...drawnNames, drawnName]
      await setDoc(drawRef, { drawnNames: newDrawnNames }, { merge: true })
    }
  }

  const handleDraw = async () => {
    if (!currentUserId || animating || drawn) return

    // Alle bisherigen Ziehungen aller User laden
    const drawsSnapshot = await getDocs(collection(db, 'draws'))
    const alreadyDrawnAll: string[] = []
    drawsSnapshot.forEach(doc => {
      const names: string[] = doc.data().drawnNames || []
      alreadyDrawnAll.push(...names)
    })

    // Verfügbare Teilnehmer filtern
    const available = participants
      .filter(p => p.id !== currentUserId) // sich selbst nicht ziehen
      .filter(p => !alreadyDrawnAll.includes(p.name)) // schon gezogen?

    if (available.length === 0) {
      alert('Alle Teilnehmer wurden bereits gezogen.')
      return
    }

    setAnimating(true)
    const random = available[Math.floor(Math.random() * available.length)]
    houseRef.current?.play()

    setTimeout(async () => {
      setDrawn(random.name)
      await saveDraw(currentUserId, random.name)
      setIsNewDraw(true)
      setShowPopup(true)
      setAnimating(false)
      setTimeout(() => setVisible(true), 100)
    }, 3500)
  }

  const handleShowName = () => {
    setVisible(true)
    setTimeout(() => setVisible(false), 5000)
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full sm:px-10 gap-6">
      <div className="text-center mb-4">
        <GlowTitle
          text="Mein Wichtelopfer:"
          size="text-3xl sm:text-4xl"
          color="#FFD700"
          shadowColor="#FF4500"
        />
      </div>

      {/* Container Haus / Schneekugel / Button */}
      <div className="relative w-full max-w-[95%] mt-6 flex justify-center" style={{ minHeight: 400 }}>
        {!drawn && (
          <Lottie
            lottieRef={houseRef}
            animationData={giftHouseAnim}
            loop={false}
            autoplay={false}
            className="z-0"
          />
        )}

        {drawn && (
          <div className="relative flex flex-col items-center z-0">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <Lottie animationData={snowGlobeAnim} loop />
            </div>
            <div className="relative flex justify-center items-center w-72 sm:w-80 p-4 rounded-t-[50%] rounded-b-xl bg-red-600 border-4 border-yellow-400 shadow-[0_0_35px_#FFD700] mt-[-40px]">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_#FFD700] text-center tracking-wider"
                style={{ filter: visible ? 'blur(0px)' : 'blur(8px)', transition: 'filter 0.3s' }}
              >
                {drawn}
              </span>
            </div>
            <div className="absolute top-0 right-0">
              <IconButton onClick={handleShowName} sx={{ color: '#FFD700' }}>
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </div>
          </div>
        )}

        {!drawn && !animating && !loading && (
          <motion.div className="absolute top-0 z-10 flex justify-center w-full">
            <GlowButton onClick={handleDraw} text="Los ziehen" />
          </motion.div>
        )}
      </div>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && drawn && isNewDraw && (
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
              <div className="relative w-56 h-56">
                <Lottie animationData={giftBoxAnim} loop={false} />
                {visible && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_#FFD700]"
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: -50, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                  >
                    {drawn}
                  </motion.div>
                )}
              </div>

              <button
                onClick={() => {
                  setShowPopup(false)
                  setVisible(false)
                  setIsNewDraw(false)
                }}
                className="mt-10 px-5 py-2 bg-green-600 text-white rounded-xl font-semibold"
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
