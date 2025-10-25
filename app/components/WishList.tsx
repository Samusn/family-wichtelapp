'use client'

import React, { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { auth } from '@/firebase/auth'
import { getWishlist, saveWishlist } from '@/firebase/firestore'
import GlowTitle from '@components/GlowTitle'
import { motion } from 'framer-motion'

export default function WishList() {
  const [items, setItems] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) return
      const savedItems = await getWishlist(user.uid)
      setItems(savedItems)
      setLoading(false)
    }
    fetchData()
  }, [])

  const addItem = async () => {
    if (input.trim() === '') return
    const newItems = [...items, input.trim()]
    setItems(newItems)
    setInput('')
    const user = auth.currentUser
    if (user) {
      await saveWishlist(user.uid, newItems)
    }
  }

  const removeItem = async (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    const user = auth.currentUser
    if (user) {
      await saveWishlist(user.uid, newItems)
    }
  }

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>

  return (
    <div className='flex justify-center w-full'>
      <div className='w-full max-w-4xl flex flex-col gap-5 px-4 sm:px-0'>
        <div className='text-center mb-4'>
          <GlowTitle
            text='Wunschliste'
            size='text-3xl'
            color='#00a000'
            shadowColor='#99ff66'
          />
        </div>

        {/* Eingabe */}
        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Wunsch hinzufügen...'
            className='flex-1 p-3 border border-green-400 rounded-2xl text-white bg-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-green-300'
          />
          <button
            onClick={addItem}
            className='bg-green-600 text-white p-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center'
          >
            <AddIcon fontSize='small' />
          </button>
        </div>

        {/* Wunschliste Items */}
        <div className='flex flex-col gap-4'>
          {items.length === 0 && (
            <p className='text-center text-green-200 italic'>Noch keine Wünsche ✨</p>
          )}

          {items.map((item, index) => (
            <motion.div
              key={index}
              className='flex items-center w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 border-2 border-green-500 shadow-[0_0_15px_#3ce35f] text-green-200 font-semibold text-lg hover:scale-[1.02] hover:shadow-[0_0_25px_#1cff87] transition-all duration-200'
            >
              {/* Icon links */}
              <div className='flex-shrink-0 w-8 flex justify-center'>
                <AddIcon style={{ color: '#00ff66', fontSize: 20 }} />
              </div>

              {/* Text zentriert */}
              <div className='flex-grow text-center truncate'>
                {item}
              </div>

              {/* Delete rechts */}
              <button
                onClick={() => removeItem(index)}
                className='flex-shrink-0 w-8 flex justify-center text-red-500 hover:text-red-700 active:scale-90 transition-transform'
              >
                <DeleteIcon fontSize='small' />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
