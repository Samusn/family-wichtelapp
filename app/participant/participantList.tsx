'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, doc, getDocs, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import PersonIcon from '@mui/icons-material/Person'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GlowTitle from '@components/GlowTitle'
import { motion } from 'framer-motion'

interface UserData {
  id: string
  name: string
  role: string
}

export default function ParticipantList() {
  const [participants, setParticipants] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawnUserId, setDrawnUserId] = useState<string | null>(null)
  const [usersWhoDrew, setUsersWhoDrew] = useState<string[]>([]) // ids der Teilnehmer, die selbst schon gezogen haben

  // Lade gezogene Person von mir
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      // Wer habe ich gezogen
      const drawRef = doc(db, 'draws', user.uid)
      const drawSnap = await getDoc(drawRef)
      if (drawSnap.exists()) {
        const names = drawSnap.data()?.drawnNames || []
        const lastName = names[names.length - 1]

        if (lastName) {
          const usersRef = collection(db, 'users')
          const snapshot = await getDocs(usersRef)
          const found = snapshot.docs
            .map(d => ({ id: d.id, ...(d.data() as UserData) }))
            .find(u => u.name === lastName)

          if (found) setDrawnUserId(found.id)
        }
      }

      // Wer hat selbst schon gezogen
      const allDrawsSnap = await getDocs(collection(db, 'draws'))
      const drawnIds: string[] = []
      allDrawsSnap.forEach(docSnap => {
        if (docSnap.data()?.drawnNames?.length > 0) {
          drawnIds.push(docSnap.id)
        }
      })
      setUsersWhoDrew(drawnIds)
    })

    return () => unsubscribe()
  }, [])

  // Lade Teilnehmer
  useEffect(() => {
    const load = async () => {
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)

        const list = snapshot.docs
          .map(d => ({ id: d.id, ...(d.data() as UserData) }))
          .filter(u => u.role === 'user')

        setParticipants(list)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center items-center p-10">
        <div className="loading loading-spinner text-green-600"></div>
      </div>
    )

  if (participants.length === 0)
    return (
      <p className="text-center text-green-600 mt-4">
        Keine Teilnehmer gefunden.
      </p>
    )

  // Sortierung: Dein gezogener User oben, Rest alphabetisch
  const sorted = participants
    .filter(p => p.id !== drawnUserId)
    .sort((a, b) => a.name.localeCompare(b.name))
  const finalList = drawnUserId
    ? [participants.find(p => p.id === drawnUserId)!, ...sorted]
    : sorted

  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-0">
      <GlowTitle
        text="Teilnehmerliste"
        size="text-3xl sm:text-4xl"
        color="#00ff66"
        shadowColor="#33ff99"
      />

      <div className="mt-6 w-full max-w-4xl flex flex-col gap-5">
        {finalList.map((user) => {
          const isDrawnPerson = user.id === drawnUserId
          const hasDrawn = usersWhoDrew.includes(user.id) // ob die Person selbst schon gezogen hat

          return (
            <Link key={user.id} href={`/participant/${user.id}`}>
              <motion.div
                className={`
                  relative flex flex-col items-center w-full p-5 rounded-2xl
                  bg-gradient-to-r from-[#0a0a0a]/20 via-[#0a0a0a]/10 to-[#0a0a0a]/20
                  backdrop-blur-lg
                  hover:scale-[1.03] cursor-pointer
                  transition-all duration-300
                  overflow-hidden
                `}
                style={{
                  boxShadow: isDrawnPerson
                    ? '0 0 25px 10px rgba(255, 215, 0, 0.45)'
                    : '0 0 15px 6px rgba(0, 255, 102, 0.20)',
                  border: `1px solid ${
                    isDrawnPerson ? '#ffd700' : 'rgba(0,255,100,0.25)'
                  }`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* NAME ROW */}
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {isDrawnPerson ? (
                      <CardGiftcardIcon
                        style={{
                          color: '#ffd700',
                          fontSize: 28,
                        }}
                      />
                    ) : (
                      <PersonIcon
                        style={{
                          color: '#00ff66',
                          fontSize: 28,
                        }}
                      />
                    )}
                  </div>

                  <div className="flex-grow text-center text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-600">
                    {user.name}
                  </div>

                  <div className="flex-shrink-0 w-10 flex justify-center">
                    <ArrowForwardIosIcon
                      style={{
                        color: isDrawnPerson ? '#ffd700' : '#00ff66',
                        fontSize: 18,
                      }}
                    />
                  </div>
                </div>

                {/* STATUS (unten klein & dezent) */}
                <div className="mt-2 flex items-center gap-2 text-[12px] text-gray-300 opacity-90">
                  {hasDrawn ? (
                    <>
                      <CheckCircleIcon style={{ fontSize: 16, color: '#ffd700' }} />
                      <span>schon gezogen</span>
                    </>
                  ) : (
                    <>
                      <HourglassEmptyIcon style={{ fontSize: 16, color: '#00ff66' }} />
                      <span>noch nicht gezogen</span>
                    </>
                  )}
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
