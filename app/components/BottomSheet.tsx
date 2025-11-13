'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/firebase/auth'
import { getUserData, UserData } from '@/firebase/firestore'
import LogoutButton from '@components/LogoutBtn'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
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
          className='fixed inset-0 bg-black/25 z-50'
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-60 bg-white/5 backdrop-blur-lg rounded-t-3xl shadow-xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className='flex justify-end p-4'>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-100 transition-colors z-70 relative'
          >
            <CloseIcon fontSize='medium' />
          </button>
        </div>

        <div className='flex flex-col w-full gap-3 p-6 relative z-70'>
          {/* Hilfsbot / Chatbot */}
          <motion.button
            onClick={() => setChatOpen(true)}
            className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-800/30 border-2 border-yellow-400 shadow-[0_0_15px_#ffbb33] text-yellow-300 font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#ffc966] transition-all duration-200 relative z-70'
          >
            <ChatIcon className='text-yellow-400' />
            Hilfsbot
          </motion.button>

          {/* Profil */}
          <motion.button
            className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-800/20 border-2 border-red-600 shadow-[0_0_15px_#ff5555] text-red-200 font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#ff7777] transition-all duration-200'
          >
            <PersonIcon className='text-red-300' />
            {userData ? userData.name : 'Profil'}
          </motion.button>

          {/* Einstellungen / Impressum */}
          <motion.button
            className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-800/20 border-2 border-red-600 shadow-[0_0_15px_#ff5555] text-red-200 font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#ff7777] transition-all duration-200'
          >
            <SettingsIcon className='text-red-300' />
            Impressum
          </motion.button>

          <div className='border-t border-red-500 my-3' />

          {/* Logout */}
          <motion.div className='w-full'>
            <LogoutButton
              className='w-full bg-red-600 text-white px-4 py-3 rounded-2xl shadow-[0_0_20px_#ff4d4d] hover:shadow-[0_0_35px_#ff6666] hover:bg-red-700 transition font-semibold flex justify-center items-center'
              label='Abmelden'
            />
          </motion.div>
        </div>
      </div>

      {/* Chatbot-Popup */}
      <Chatbot open={chatOpen} setOpen={setChatOpen} />
    </>
  )
}
