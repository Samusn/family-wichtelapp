'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, doc, getDocs, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import PersonIcon from '@mui/icons-material/Person'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import GlowTitle from '@components/GlowTitle'
import { motion } from 'framer-motion'

interface UserData {
  id: string
  name: string
  role: string
}

export default function ParticipantList() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [participants, setParticipants] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [drawnUserId, setDrawnUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        const drawRef = doc(db, 'draws', user.uid)
        const drawSnap = await getDoc(drawRef)
        if (drawSnap.exists()) {
          const drawnNames: string[] = drawSnap.data()?.drawnNames || []
          const lastDrawnName = drawnNames[drawnNames.length - 1] || null
          if (lastDrawnName) {
            const usersRef = collection(db, 'users')
            const snapshot = await getDocs(usersRef)
            const drawnUser = snapshot.docs
              .map(doc => ({ id: doc.id, ...(doc.data() as UserData) }))
              .find(u => u.name === lastDrawnName)
            if (drawnUser) setDrawnUserId(drawnUser.id)
          }
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
          .map(doc => ({ id: doc.id, ...(doc.data() as UserData) }))
          .filter(u => u.role === 'user')
        setParticipants(users)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchParticipants()
  }, [])

  const sortedParticipants = participants
    .filter(p => p.id !== drawnUserId)
    .sort((a, b) => a.name.localeCompare(b.name))
  const drawnUser = participants.find(p => p.id === drawnUserId)
  const finalList = drawnUser ? [drawnUser, ...sortedParticipants] : sortedParticipants

  if (loading)
    return (
      <div className='flex justify-center items-center p-10'>
        <div className='loading loading-spinner text-green-600'></div>
      </div>
    )

  if (participants.length === 0)
    return (
      <p className='text-center text-green-600 mt-4'>
        Keine Teilnehmer gefunden.
      </p>
    )

  return (
    <div className='flex flex-col items-center w-full px-4 sm:px-0'>
      <GlowTitle
        text='Teilnehmerliste'
        size='text-3xl sm:text-4xl'
        color='#00ff66'
        shadowColor='#33ff99'
      />

      <div className='mt-6 w-full max-w-4xl flex flex-col gap-5'>
        {finalList.map(user => {
          const isDrawn = user.id === drawnUserId
          return (
            <Link key={user.id} href={`/participant/${user.id}`}>
              <motion.div
                className={`
                  relative flex items-center w-full p-5 rounded-2xl
                  bg-gradient-to-r from-[#0a0a0a]/20 via-[#0a0a0a]/10 to-[#0a0a0a]/20
                  backdrop-blur-lg
                  border-t border-b border-transparent
                  hover:scale-[1.03] cursor-pointer
                  transition-all duration-300
                  overflow-hidden
                `}
                style={{
                  borderImage: `radial-gradient(circle, ${isDrawn ? '#ffd700' : '#00ff66'} 0%, rgba(0,0,0,0) 100%) 1`,
                  boxShadow: isDrawn
                    ? '0 0 30px 10px rgba(255, 215, 0, 0.5)'
                    : '0 0 30px 10px rgba(0, 255, 102, 0.2)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Neon Glow Circles */}
                <div className='absolute -top-8 -left-8 w-32 h-32 rounded-full bg-yellow-400/20 blur-3xl'></div>
                <div className='absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-green-400/20 blur-3xl'></div>

                <div className='flex items-center w-full'>
                  {/* Icon links */}
                  <div className='flex-shrink-0 w-10 flex justify-center'>
                    {isDrawn ? (
                      <CardGiftcardIcon style={{ color: '#ffd700', fontSize: 28 }} />
                    ) : (
                      <PersonIcon style={{ color: '#00ff66', fontSize: 28 }} />
                    )}
                  </div>

                  {/* Name zentriert */}
                  <div className='flex-grow text-center text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-600'>
                    {user.name}
                  </div>

                  {/* Pfeil rechts */}
                  <div className='flex-shrink-0 w-10 flex justify-center'>
                    <ArrowForwardIosIcon
                      style={{ color: isDrawn ? '#ffd700' : '#00ff66', fontSize: 18 }}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
