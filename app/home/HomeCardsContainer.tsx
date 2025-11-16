'use client'
import React, { useState, useRef, useEffect } from 'react'
import Lottie from 'lottie-react'
import treeAnim from '@components/assets/tree.json'
import Link from 'next/link'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PeopleIcon from '@mui/icons-material/People'
import { motion } from 'framer-motion'

export default function HomeCardsContainer() {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(expanded ? contentRef.current.scrollHeight : 0)
    }
  }, [expanded])

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6">

      {/* Baum */}
      <div className="w-60 h-60">
        <Lottie animationData={treeAnim} loop />
      </div>

      {/* Accordion */}
      <div className="w-full">
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between cursor-pointer bg-yellow-300/80 text-black font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all select-none whitespace-nowrap"
        >
          Willkommen auf der Wichtel-App
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </div>

        <motion.div
          animate={{ height }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div
            ref={contentRef}
            className="w-full rounded-xl p-6 text-gray-200 text-left leading-relaxed shadow-lg break-words whitespace-normal mt-2 max-w-[28rem]"
          >
            <p className="mb-2">
              Herzlich willkommen auf meiner Wichtel-App! Mit dieser App kannst du den Wichtelspass in vollen Zügen geniessen.
            </p>
            <p className="mb-2">
              Ihr habt eine Liste der{' '}
              <Link href="/participant" className="font-semibold text-yellow-300 hover:text-yellow-400">
                Teilnehmer
              </Link>
              , über die ihr auch auf die individuellen Wunschlisten der Personen kommt.
            </p>
            <p className="mb-2">
              Ihr könnt ebenfalls eine{' '}
              <Link href="/wishpage" className="font-semibold text-yellow-300 hover:text-yellow-400">
                Wunschliste
              </Link>{' '}
              erstellen und habt sogar den{' '}
              <span className="font-semibold text-green-300">SamiGPT-67</span> als Hilfe zur Verfügung.
            </p>
            <p className="mb-2">
              Was nicht fehlen darf, ist der{' '}
              <Link href="/draw" className="font-semibold text-red-400 hover:text-red-500">
                Wichtel-Los
              </Link>
              .
            </p>
            <p className="mt-4">
              Bei Fragen: kontaktiert mich. Ich wünsche euch viel Freude und bis bald!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Drei Buttons unten */}
      <div className="flex flex-col gap-4 w-full mt-4">
        <Link href="/participant">
          <button className="relative w-full py-3 rounded-2xl bg-green-500 text-white font-bold shadow-[0_0_15px_rgba(60,227,95,0.5)] hover:shadow-[0_0_25px_rgba(60,227,95,0.6)] transition flex items-center justify-center gap-2">
            <PeopleIcon className="absolute left-8" /> Teilnehmerliste
          </button>
        </Link>
        <Link href="/wishpage">
          <button className="relative w-full py-3 rounded-2xl bg-green-500 text-white font-bold shadow-[0_0_15px_rgba(60,227,95,0.5)] hover:shadow-[0_0_25px_rgba(60,227,95,0.6)] transition flex items-center justify-center gap-2">
            <ListAltIcon className="absolute left-8" /> Wunschliste
          </button>
        </Link>
        <Link href="/draw">
          <button className="relative w-full py-3 rounded-2xl bg-green-500 text-white font-bold shadow-[0_0_15px_rgba(60,227,95,0.5)] hover:shadow-[0_0_25px_rgba(60,227,95,0.6)] transition flex items-center justify-center gap-2">
            <CardGiftcardIcon className="absolute left-8" /> Wichtel-Los
          </button>
        </Link>
      </div>
    </div>
  )
}
