'use client'
import React, { useState } from 'react'
import Lottie from 'lottie-react'
import treeAnim from '@components/assets/tree.json'
import messages from '@components/assets/messages.json'
import Link from 'next/link'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PeopleIcon from '@mui/icons-material/People'
import { motion, AnimatePresence } from 'framer-motion'

export default function HomeCardsContainer() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const days = Array.from({ length: 24 }, (_, i) => i + 1)

  // Heutiges Datum
  const today = new Date()
  const currentDay = today.getMonth() === 11 ? today.getDate() : 0 // nur Dezember

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6">

      {/* Baum */}
      <div className="w-60 h-60">
        <Lottie animationData={treeAnim} loop />
      </div>

      {/* Anleitung */}
      <div className="w-full bg-white/20 rounded-xl p-4 text-gray-200 text-center backdrop-blur-md shadow-lg">
        Hier kommt eine kurze Anleitung für die App. Klick auf die Buttons, um dein Los zu ziehen, deine Wunschliste zu sehen oder die Teilnehmerliste anzuschauen.
      </div>

      {/* Drei Buttons */}
      <div className="flex flex-col gap-4 w-full mt-4">
        <Link href="/draw">
          <button className="w-full py-3 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <CardGiftcardIcon /> Wichtellos ziehen
          </button>
        </Link>
        <Link href="/wishpage">
          <button className="w-full py-3 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <ListAltIcon /> Wunschliste
          </button>
        </Link>
        <Link href="/participant">
          <button className="w-full py-3 bg-green-500 text-white font-bold rounded-2xl shadow-lg hover:bg-green-600 transition-transform transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <PeopleIcon /> Teilnehmerliste
          </button>
        </Link>
      </div>

      {/* Adventskalender Überschrift */}
      <h2 className="mt-6 text-2xl font-bold text-yellow-300 drop-shadow-md">
         Adventskalender
      </h2>
      <p className="text-gray-300 text-sm text-center mb-2">
        Klicke auf das jeweilige Türchen, um einen Spruch zu sehen.
      </p>

      {/* Adventskalender Grid */}
      <div className="grid grid-cols-6 gap-3 mt-2 w-full">
        {days.map((day) => {
          const isActive = day <= currentDay // nur Tage bis heute aktiv
          return (
            <div
              key={day}
              onClick={() => isActive && setSelectedDay(day)}
              className={`
                w-12 h-12 flex items-center justify-center rounded-lg shadow-lg 
                ${isActive ? 'bg-red-600 hover:bg-red-700 hover:scale-110 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}
                text-white font-bold transition-transform transform
              `}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Popup für Spruch */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            key="popup"
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <p className="text-gray-800 font-semibold text-lg">
                {messages[selectedDay - 1]}
              </p>
              <button
                onClick={() => setSelectedDay(null)}
                className="mt-4 px-5 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600 transition-colors"
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
