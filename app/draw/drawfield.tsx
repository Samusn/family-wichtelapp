'use client'

import { useEffect, useState, useRef } from 'react'
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import Confetti from 'react-confetti'
import { Button, IconButton } from '@mui/material'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

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
  const [showNameInPopup, setShowNameInPopup] = useState(false)
  const [showFinal, setShowFinal] = useState(false)
  const [visible, setVisible] = useState(false)
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

  // Scroll sperren, wenn Popup geöffnet ist
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

  const saveDraw = async (userId: string, drawnName: string) => {
    const drawRef = doc(db, 'draws', userId)
    const drawSnap = await getDoc(drawRef)
    const drawnNames: string[] = drawSnap?.data()?.drawnNames || []
    const newDrawnNames = [...drawnNames, drawnName]
    await setDoc(drawRef, { drawnNames: newDrawnNames }, { merge: true })
  }

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
    houseRef.current?.play()

    setTimeout(async () => {
      setDrawn(random.name)
      await saveDraw(currentUserId, random.name)
      setShowPopup(true)
      setAnimating(false)
      setTimeout(() => setShowNameInPopup(true), 100)
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

      {/* Container für Haus / Schneekugel / Button */}
      <div className="relative w-full max-w-[95%] mt-6 flex justify-center" style={{ minHeight: 400 }}>
        {/* Haus */}
        {!drawn && (
          <Lottie
            lottieRef={houseRef}
            animationData={giftHouseAnim}
            loop={false}
            autoplay={false}
            className="z-0"
          />
        )}

        {/* Schneekugel + Name + Visibility (nach Ziehen) */}
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

        {/* Button absolut über dem Haus */}
        {!drawn && !animating && !loading && (
          <motion.div
            className="absolute top-0 z-10 flex justify-center w-full"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Button
              onClick={handleDraw}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #ff4444, #ff8c00, #32cd32)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                px: 6,
                py: 2.5,
                borderRadius: '9999px',
                boxShadow: '0 0 20px #FFD700',
                '&:hover': {
                  background: 'linear-gradient(90deg, #ff6347, #ffa500, #3cb371)',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
              endIcon={<CardGiftcardIcon sx={{ fontSize: 28, marginLeft: 1 }} />}
            >
              Los ziehen
            </Button>
          </motion.div>
        )}
      </div>

      {/* Popup */}
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
    </div>
  )
}
