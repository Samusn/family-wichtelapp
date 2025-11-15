'use client'

import React, { useState, useEffect } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import ImageIcon from '@mui/icons-material/Image'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { auth } from '@/firebase/auth'
import { getWishlist, saveWishlist } from '@/firebase/firestore'
import { uploadImageAndGetURL, deleteImageFromURL } from '@/firebase/storage'
import { Dialog } from '@headlessui/react'
import GlowTitle from '@components/GlowTitle'
import Chatbot from '@components/Chatbot'
import { motion } from 'framer-motion'
import StyledButton from '@components/AddWishButton'
import BigButton from '@components/BigButton'

interface WishItem {
  text: string
  link?: string
  imageUrl?: string
}

export default function WishList() {
  const [items, setItems] = useState<WishItem[]>([])
  const [input, setInput] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const saveItem = async () => {
    if (input.trim() === '') return
    const user = auth.currentUser
    if (!user) return

    setUploading(true)
    let imageUrl = ''
    try {
      if (image) {
        imageUrl = await uploadImageAndGetURL(user.uid, image)
      }

      const newItem = { text: input.trim(), link, imageUrl }
      let newItems = [...items]
      if (editingIndex !== null) {
        newItems[editingIndex] = newItem
      } else {
        newItems.push(newItem)
      }

      setItems(newItems)
      setInput('')
      setLink('')
      setImage(null)
      setPreview(null)
      setEditingIndex(null)
      setOpen(false)
      await saveWishlist(user.uid, newItems)
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
    } finally {
      setUploading(false)
    }
  }

  const removeItem = async (index: number) => {
    const item = items[index]
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    const user = auth.currentUser
    if (user) {
      await saveWishlist(user.uid, newItems)
      if (item.imageUrl) {
        await deleteImageFromURL(item.imageUrl)
      }
    }
  }

  const editItem = (index: number) => {
    const item = items[index]
    setInput(item.text)
    setLink(item.link || '')
    setPreview(item.imageUrl || null)
    setEditingIndex(index)
    setOpen(true)
  }

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>

  return (
    <div className='flex justify-center w-full'>
      <div className='w-full max-w-md flex flex-col gap-5 px-4 sm:px-0'>
        {/* Titel */}
        <div className='text-center mb-4'>
          <GlowTitle
            text='Wunschliste'
            size='text-3xl sm:text-4xl'
            color='#00ff66'
            shadowColor='#33ff99'
          />
        </div>

        {/* Buttons */}
        <div className='flex gap-2'>
          <StyledButton
            onClick={() => {
              setInput('')
              setLink('')
              setImage(null)
              setPreview(null)
              setEditingIndex(null)
              setOpen(true)
            }}
          />
          
          <BigButton onClick={() => setChatOpen(true)} />
        </div>

        {/* Wunschliste */}
        <div className='flex flex-col gap-4 mt-4'>
          {items.length === 0 && (
            <p className='text-center text-white italic'>Noch keine Wünsche ✨</p>
          )}

          {items.map((item, index) => (
            <WishCard
              key={index}
              item={item}
              onEdit={() => editItem(index)}
              onDelete={() => removeItem(index)}
            />
          ))}
        </div>

        {/* Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} className='relative z-50'>
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4'>
            <Dialog.Panel className='bg-red-900 p-6 rounded-2xl shadow-lg max-w-sm w-full text-white border border-yellow-400'>
              <Dialog.Title className='text-xl font-bold mb-3'>
                {editingIndex !== null ? 'Wunsch bearbeiten 🎁' : 'Neuer Wunsch 🎁'}
              </Dialog.Title>

              <input
                type='text'
                placeholder='Wunschtext'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='w-full mb-3 p-2 rounded-md bg-red-800 border border-red-500 placeholder-white focus:outline-none text-white'
              />
              <input
                type='text'
                placeholder='Optional: Link'
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className='w-full mb-4 p-2 rounded-md bg-red-800 border border-red-500 placeholder-white focus:outline-none text-white'
              />

              <label className='flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer mb-3'>
                <ImageIcon fontSize='small' /> Bild auswählen
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageChange}
                />
              </label>

              {preview && (
                <img
                  src={preview}
                  alt='Preview'
                  className='rounded-lg w-full max-h-48 object-cover mb-4'
                />
              )}

              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setOpen(false)}
                  className='text-green-300 hover:text-white'
                  disabled={uploading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveItem}
                  disabled={uploading}
                  className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-50'
                >
                  {uploading ? 'Lädt...' : 'Speichern'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {chatOpen && <Chatbot open={chatOpen} setOpen={setChatOpen} />}
      </div>
    </div>
  )
}

interface WishCardProps {
  item: WishItem
  onEdit: () => void
  onDelete: () => void
}

function WishCard({ item, onEdit, onDelete }: WishCardProps) {
  return (
    <motion.div
      className='relative flex flex-col gap-2 w-full p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden'
      style={{
        borderColor: '#FFD700',
        boxShadow: '0 0 15px 5px rgba(255,0,0,0.6), 0 0 20px 5px rgba(255,215,0,0.5)',
      }}
    >
      {/* Pulsing circles */}
      <div className='absolute -top-6 -left-6 w-32 h-32 rounded-full bg-red-400/30 blur-3xl animate-pulse'></div>
      <div className='absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-red-600/30 blur-3xl animate-pulse'></div>

      <div className='flex justify-between items-start'>
        <div className='flex-grow text-left'>
          {/* Wunschtext oben */}
          <div className='text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-yellow-200 to-red-400 font-semibold break-words'>
            {item.text}
          </div>

          {/* Link unten mit Material-Icon */}
          {item.link && (
            <a
              href={item.link}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-1 inline-flex items-center text-yellow-400 hover:text-yellow-200 text-sm font-medium'
            >
              Link <ArrowForwardIcon fontSize='small' className='ml-1' />
            </a>
          )}
        </div>

        {/* Buttons */}
        <div className='flex gap-2 ml-2'>
          <button onClick={onEdit} className='text-yellow-400 hover:text-yellow-200'>
            <EditIcon fontSize='small' />
          </button>
          <button onClick={onDelete} className='text-red-600 hover:text-red-400'>
            <DeleteOutlineIcon fontSize='small' />
          </button>
        </div>
      </div>

      {/* Optionales Bild */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt='Wunschbild'
          className='rounded-xl w-full max-h-48 object-cover mt-2'
        />
      )}
    </motion.div>
  )
}
