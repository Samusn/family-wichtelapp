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
        color='#00a000'
        shadowColor='#99ff66'
      />

      <div className='mt-6 w-full max-w-4xl flex flex-col gap-4'>
        {finalList.map(user => {
          const isDrawn = user.id === drawnUserId
          return (
            <Link key={user.id} href={`/participant/${user.id}`}>
              <motion.div
                className={`
                  relative flex items-center w-full py-4 px-4 rounded-2xl
                  backdrop-blur-md bg-white/10 border-2
                  shadow-[0_0_15px_#3ce35f] text-green-200 font-semibold text-lg
                  hover:scale-[1.02] hover:shadow-[0_0_25px_#1cff87] cursor-pointer
                  transition-all duration-200
                `}
                style={{
                  borderColor: isDrawn ? '#ffd700' : '#00a000',
                  backgroundColor: isDrawn ? 'rgba(255, 223, 0, 0.15)' : 'rgba(0,160,0,0.1)',
                  color: isDrawn ? '#ffd700' : '#00ff66',
                }}
              >
                <div className='flex items-center w-full'>
                  {/* Icon links */}
                  <div className='flex-shrink-0 w-8 flex justify-center'>
                    {isDrawn ? (
                      <CardGiftcardIcon style={{ color: '#ffd700' }} />
                    ) : (
                      <PersonIcon style={{ color: '#00ff66' }} />
                    )}
                  </div>

                  {/* Name zentriert */}
                  <div className='flex-grow text-center'>
                    {user.name}
                  </div>

                  {/* Pfeil rechts */}
                  <div className='flex-shrink-0 w-8 flex justify-center'>
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
