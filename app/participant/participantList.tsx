'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  collection,
  doc,
  getDocs,
  getDoc,
} from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import PersonIcon from '@mui/icons-material/Person'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import GlowTitle from '@components/GlowTitle'

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
    <div className='flex justify-center w-full'>
      <ul className='w-full max-w-4xl flex flex-col gap-6 px-4 sm:px-0'>
        <li className='text-center mb-6'>
          <GlowTitle
            text='Teilnehmerliste'
            size='text-3xl sm:text-4xl'
            color='#00a000'
            shadowColor='#99ff66'
          />
        </li>

        {finalList.map(user => (
          <li
            key={user.id}
            className={`relative flex items-center justify-between w-full px-6 py-4 rounded-3xl shadow-xl border transition-transform duration-300 hover:scale-[1.02] ${
              user.id === drawnUserId
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <Link
              href={`/participant/${user.id}`}
              className='relative flex items-center gap-4 flex-grow z-10'
            >
              {user.id === drawnUserId ? (
                <CardGiftcardIcon className='text-yellow-500' />
              ) : (
                <PersonIcon className='text-red-700' />
              )}
              <span
                className={`font-semibold text-base sm:text-lg ${
                  user.id === drawnUserId ? 'text-yellow-700' : 'text-red-800'
                }`}
              >
                {user.name}
              </span>
            </Link>
            <Link
              href={`/participant/${user.id}`}
              className='flex items-center justify-center w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 transition cursor-pointer'
            >
              <ArrowForwardIosIcon className='text-red-700 text-[14px]' />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
