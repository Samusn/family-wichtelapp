'use client'

import React, { useState, useEffect } from 'react'
import GiftIcon from '@mui/icons-material/CardGiftcard'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { auth } from '@/firebase/auth'
import { getWishlist, saveWishlist } from '@/firebase/firestore'
import GlowTitle from '@components/GlowTitle'

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

        <div className='flex gap-2 mb-4'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Wunsch hinzufügen...'
            className='flex-1 p-3 border border-gray-600 rounded-2xl text-white bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400'
          />
          <button
            onClick={addItem}
            className='bg-green-600 text-white p-3 rounded-2xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center'
          >
            <AddIcon fontSize='small' />
          </button>
        </div>

        <div className='flex flex-col gap-4'>
          {items.length === 0 && (
            <p className='text-center text-gray-400 italic'>
              Noch keine Wünsche ✨
            </p>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              className='flex justify-between items-center w-full px-6 py-4 rounded-2xl transition-all duration-200 shadow-sm border bg-gray-900 border-gray-700 hover:scale-[1.02]'
            >
              <span className='text-white font-medium truncate'>{item}</span>
              <button
                onClick={() => removeItem(index)}
                className='text-red-500 hover:text-red-700 active:scale-90 transition-transform'
              >
                <DeleteIcon fontSize='small' />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
