'use client'

import { useEffect, useState, useRef } from 'react'
import { collection, doc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import Confetti from 'react-confetti'
import { IconButton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import GlowButton from '@components/GlowButton'
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
  const [hasDrawn, setHasDrawn] = useState(false)

  const houseRef = useRef<LottieRefCurrentProps>(null)
  const scrollYRef = useRef(0)

  // Auth check & letzte Ziehung laden
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)

        // Prüfen, ob der User schon gezogen hat
        const drawRef = doc(db, 'draws', user.uid)
        const drawSnap = await getDocs(collection(db, 'draws'))
        const userDrawSnap = drawSnap.docs.find(d => d.id === user.uid)
        const drawnNames: string[] = userDrawSnap?.data().drawnNames || []

        if (drawnNames.length > 0) {
          setDrawn(drawnNames[drawnNames.length - 1])
          setHasDrawn(true)
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

  const handleDraw = async () => {
    if (!currentUserId || animating || hasDrawn) return

    setAnimating(true)
    houseRef.current?.play()

    try {
      // Transaction: atomare globale Ziehung
      const drawnName = await runTransaction(db, async (transaction) => {
        // Alle bisher gezogenen Namen
        const drawnNamesSnapshot = await getDocs(collection(db, 'drawnNames'))
        const takenNames = drawnNamesSnapshot.docs.map(d => d.id)

        // Verfügbare Teilnehmer: nicht der eigene Name & noch nicht gezogen
        const available = participants
          .filter(p => p.id !== currentUserId)
          .filter(p => !takenNames.includes(p.name))

        if (available.length === 0) throw new Error('Alle Teilnehmer wurden bereits gezogen.')

        const random = available[Math.floor(Math.random() * available.length)]

        // Global speichern
        const globalDrawRef = doc(db, 'drawnNames', random.name)
        transaction.set(globalDrawRef, { userId: currentUserId, timestamp: serverTimestamp() })

        // User-spezifisch speichern
        const userDrawRef = doc(db, 'draws', currentUserId)
        transaction.set(userDrawRef, { drawnNames: [random.name] }, { merge: true })

        return random.name
      })

      // Animationen & Popup
      setTimeout(() => {
        setDrawn(drawnName)
        setHasDrawn(true)
        setIsNewDraw(true)
        setShowPopup(true)
        setAnimating(false)
        setTimeout(() => setVisible(true), 100)
      }, 3500)

    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Fehler bei der Ziehung')
      setAnimating(false)
    }
  }

  const handleShowName = () => setVisible(!visible)

  return (
    <div className="relative flex flex-col items-center justify-center w-full sm:px-10 gap-6">
      <div className='text-center mb-4'>
        <GlowTitle
          text='Mein Wichtelopfer'
          size='text-5xl sm:text-4xl'
          color='#00ff66'
          shadowColor='#33ff99'
        />
      </div>

      <div className="relative w-full max-w-[95%] mt-6 flex justify-center" style={{ minHeight: 400 }}>
        {!drawn && (
          <Lottie
            lottieRef={houseRef}
            animationData={giftHouseAnim}
            loop={false}
            autoplay={false}
            className="z-0 pointer-events-none"
          />
        )}

        {drawn && (
          <div className="relative flex flex-col items-center z-0 w-full max-w-[320px] sm:max-w-[400px]">
            <div className="relative w-full h-64 sm:h-80">
              <Lottie animationData={snowGlobeAnim} loop className="pointer-events-none"/>
            </div>
            <div className="relative flex justify-center items-center w-full p-4 rounded-t-[50%] rounded-b-xl bg-red-600 border-4 border-yellow-400 shadow-[0_0_35px_#FFD700] mt-[-10px] sm:mt-0">
              <span
                className="text-3xl sm:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_15px_#FFD700] text-center tracking-wider"
                style={{ filter: visible ? 'blur(0px)' : 'blur(8px)', transition: 'filter 0.3s' }}
              >
                {drawn}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <IconButton onClick={handleShowName} sx={{ color: '#FFD700' }} size="large">
                {visible ? <VisibilityOffIcon fontSize="large"/> : <VisibilityIcon fontSize="large"/>}
              </IconButton>
            </div>
          </div>
        )}

        {!drawn && !animating && !loading && (
          <motion.div className="absolute top-0 z-10 flex justify-center w-full">
            <GlowButton
              onClick={handleDraw}
              text={hasDrawn ? 'Du hast bereits gezogen' : 'Los ziehen'}
              disabled={hasDrawn}
            />
          </motion.div>
        )}
      </div>

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
              <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                <Lottie animationData={giftBoxAnim} loop={false} className="pointer-events-none" />
                {visible && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_12px_#FFD700] text-center px-2"
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
                className="mt-8 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold text-lg"
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
