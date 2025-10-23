'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, doc, getDocs, getDoc, query, updateDoc, where } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import PersonIcon from '@mui/icons-material/Person'
import PushPinIcon from '@mui/icons-material/PushPin'
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
  const [pinned, setPinned] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          setPinned(userData.pinnedParticipants || [])
        }
      } else {
        setCurrentUserId(null)
        setPinned([])
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('role', '==', 'user'))
        const snapshot = await getDocs(q)
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as UserData),
        }))
        setParticipants(users)
      } catch (err) {
        console.error('Fehler beim Laden der Teilnehmer:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchParticipants()
  }, [])

  const togglePin = async (participantId: string) => {
    if (!currentUserId) return
    const newPinned = pinned.includes(participantId)
      ? pinned.filter((id) => id !== participantId)
      : [...pinned, participantId]
    setPinned(newPinned)
    try {
      const userRef = doc(db, 'users', currentUserId)
      await updateDoc(userRef, { pinnedParticipants: newPinned })
    } catch (err) {
      console.error('Fehler beim Speichern des Pins:', err)
    }
  }

  const sortedParticipants = [
    ...participants.filter((u) => pinned.includes(u.id)),
    ...participants.filter((u) => !pinned.includes(u.id)),
  ]

  if (loading)
    return (
      <div className='flex justify-center items-center p-10'>
        <div className='loading loading-spinner text-green-600'></div>
      </div>
    )

  if (participants.length === 0)
    return <p className='text-center text-green-600 mt-4'>Keine Teilnehmer gefunden.</p>

  return (
    <div className='flex justify-center w-full px-4 py-6'>
      <ul className='w-full max-w-md flex flex-col gap-5'>
        <li className='text-center mb-4'>
          <GlowTitle text='Teilnehmerliste' size='text-3xl' color='#00a000' shadowColor='#99ff66' />
        </li>

        {sortedParticipants.map((user) => (
          <li
            key={user.id}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm border ${
              pinned.includes(user.id)
                ? 'bg-green-50 border-yellow-400'
                : 'bg-white/80 border-gray-200'
            }`}
          >
            <Link href={`/participant/${user.id}`} className='flex items-center gap-3 flex-grow'>
              <PersonIcon
                className={`${
                  pinned.includes(user.id) ? 'text-green-600' : 'text-green-800'
                }`}
              />
              <span
                className={`font-semibold text-sm sm:text-base ${
                  pinned.includes(user.id) ? 'text-green-700' : 'text-gray-800'
                }`}
              >
                {user.name}
              </span>
            </Link>

            <button
              onClick={() => togglePin(user.id)}
              className='btn btn-square btn-ghost btn-sm hover:bg-yellow-100'
              title={pinned.includes(user.id) ? 'Unpin' : 'Anheften'}
            >
              <PushPinIcon
                className={pinned.includes(user.id) ? 'text-yellow-500' : 'text-gray-500'}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
