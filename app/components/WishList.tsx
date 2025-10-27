'use client'

import React, { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { auth } from '@/firebase/auth'
import { getWishlist, saveWishlist } from '@/firebase/firestore'
import GlowTitle from '@components/GlowTitle'
import { motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'

interface WishItem {
  text: string
  link?: string
}

export default function WishList() {
  const [items, setItems] = useState<WishItem[]>([])
  const [input, setInput] = useState('')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) return
      const savedItems = await getWishlist(user.uid)
      const normalized = savedItems.map((i: any) =>
        typeof i === 'string' ? { text: i } : i
      )
      setItems(normalized)
      setLoading(false)
    }
    fetchData()
  }, [])

  const addItem = async () => {
    if (input.trim() === '') return
    const newItem = { text: input.trim(), link }
    const newItems = [...items, newItem]
    setItems(newItems)
    setInput('')
    setLink('')
    setOpen(false)
    const user = auth.currentUser
    if (user) await saveWishlist(user.uid, newItems)
  }

  const removeItem = async (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    const user = auth.currentUser
    if (user) await saveWishlist(user.uid, newItems)
  }

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>

  return (
    <div className='flex justify-center w-full'>
      <div className='w-full max-w-4xl flex flex-col gap-5 px-4 sm:px-0'>
        <div className='text-center mb-4'>
          <GlowTitle text='Wunschliste' size='text-3xl' color='#00a000' shadowColor='#99ff66' />
        </div>

        <button
          onClick={() => setOpen(true)}
          className='bg-green-600 text-white font-semibold px-4 py-3 rounded-xl shadow-lg hover:scale-105 transition-all'
        >
          ➕ Wunsch hinzufügen
        </button>

        <div className='flex flex-col gap-4 mt-4'>
          {items.length === 0 && <p className='text-center text-green-200 italic'>Noch keine Wünsche ✨</p>}

          {items.map((item, index) => (
            <motion.div
              key={index}
              className='flex flex-col sm:flex-row sm:items-center gap-2 w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 border-2 border-green-500 shadow-[0_0_15px_#3ce35f] text-green-200 font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#1cff87] transition-all duration-200'
            >
              <div className='flex-grow text-center sm:text-left break-words max-w-full'>
                {item.text}
                {item.link && (
                  <a
                    href={item.link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-green-400 text-sm underline mt-1 hover:text-green-200 break-all'
                  >
                    🔗 {item.link}
                  </a>
                )}
              </div>
              <button
                onClick={() => removeItem(index)}
                className='ml-auto sm:ml-0 transition-transform hover:scale-110 text-red-600'
              >
                <DeleteOutlineIcon fontSize='small' />
              </button>
            </motion.div>
          ))}
        </div>

        <Dialog open={open} onClose={() => setOpen(false)} className='relative z-50'>
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4'>
            <Dialog.Panel className='bg-green-900 p-6 rounded-2xl shadow-lg max-w-sm w-full text-white border border-green-400'>
              <Dialog.Title className='text-xl font-bold mb-3'>Neuer Wunsch 🎁</Dialog.Title>
              <input
                type='text'
                placeholder='Wunschtext'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='w-full mb-3 p-2 rounded-md bg-green-800 border border-green-500 placeholder-green-300 focus:outline-none'
              />
              <input
                type='text'
                placeholder='Optional: Link'
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className='w-full mb-4 p-2 rounded-md bg-green-800 border border-green-500 placeholder-green-300 focus:outline-none'
              />
              <div className='flex justify-end gap-3'>
                <button onClick={() => setOpen(false)} className='text-green-300 hover:text-white'>Abbrechen</button>
                <button onClick={addItem} className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold'>Speichern</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  )
}
