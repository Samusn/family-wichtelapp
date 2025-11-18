'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/firebase/authClient'
import { getUserData, UserData } from '@/firebase/firestoreClient'
import LogoutButton from '@components/LogoutBtn'
import PersonIcon from '@mui/icons-material/Person'
import GavelIcon from '@mui/icons-material/Gavel';
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import { motion } from 'framer-motion'
import Chatbot from './Chatbot'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
}

export default function BottomSheet({ open, onClose }: BottomSheetProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser
      if (!user) return
      const data = await getUserData(user.uid)
      setUserData(data)
    }
    fetchUser()
  }, [])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/25 z-50"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-60 bg-white/5 backdrop-blur-lg rounded-t-3xl shadow-xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-3 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <CloseIcon fontSize="medium" className="text-gray-200" />
          </button>
        </div>

        {/* Inhalt */}
        <div className="flex flex-col w-full gap-3 px-6 pb-8 relative z-70">

          {/* Sami GPT */}
          <motion.button
            onClick={() => setChatOpen(true)}
            className="min-h-[50px] w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-800/30 border-2 border-yellow-400
            shadow-[0_0_15px_#ffbb33] text-yellow-300 font-semibold text-lg
            hover:scale-[1.02] hover:shadow-[0_0_25px_#ffc966]
            transition-all duration-200"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <ChatIcon className="text-yellow-400" />
            <span className="flex-1 text-left">SamiGPT-67</span>
          </motion.button>

          {/* Impressum */}
          <motion.div whileHover={{ scale: 1.01 }} className="w-full">
            <Link
              href="/impressum"
              className="min-h-[50px] w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-800/20 border-2 border-red-600
              shadow-[0_0_15px_#ff5555] text-red-200 font-semibold text-lg
              hover:shadow-[0_0_25px_#ff7777] transition-all duration-200"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <GavelIcon className="text-red-300" />
              <span className="flex-1 text-left">Impressum</span>
            </Link>
          </motion.div>

          {/* Trennlinie */}
          <div className="border-t border-red-500 my-3" />

          {/* Profil */}
          <motion.button
            className="min-h-[50px] w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-800/20 border-2 border-red-600
            shadow-[0_0_15px_#ff5555] text-red-200 font-semibold text-lg
            hover:scale-[1.02] hover:shadow-[0_0_25px_#ff7777]
            transition-all duration-200"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <PersonIcon className="text-red-300" />
            <span className="flex-1 text-left">
              {userData ? userData.name : 'Profil'}
            </span>
          </motion.button>

          {/* Logout */}
          <LogoutButton
            className="w-full min-h-[50px] bg-red-600 text-white px-4 py-3 rounded-2xl shadow-[0_0_20px_#ff4d4d]
            hover:shadow-[0_0_35px_#ff6666] hover:bg-red-700 transition font-semibold flex justify-center items-center"
            label="Abmelden"
          />
        </div>
      </div>

      <Chatbot open={chatOpen} setOpen={setChatOpen} />
    </>
  )
}
