'use client'

import React, { useState, useEffect } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import ImageIcon from '@mui/icons-material/Image'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { auth } from '@/firebase/authClient'
import { getWishlist, saveWishlist, WishItem } from '@/firebase/firestoreClient'
import { uploadImageAndGetURL, deleteImageFromURL } from '@/firebase/storageClient'
import { Dialog } from '@headlessui/react'
import GlowTitle from '@components/GlowTitle'
import Chatbot from '@components/Chatbot'
import { motion } from 'framer-motion'
import StyledButton from '@components/AddWishButton'
import BigButton from '@components/BigButton'

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
  const [error, setError] = useState('')

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const saveItem = async () => {
    if (input.trim() === '') {
      setError('Der Wunschtext darf nicht leer sein!')
      return
    }

    const user = auth.currentUser
    if (!user) return

    setUploading(true)
    setError('')
    let imageUrl = ''
    try {
      if (image) {
        imageUrl = await uploadImageAndGetURL(user.uid, image)
      }

      const newItem: WishItem = { text: input.trim(), link, imageUrl }
      const newItems = [...items]
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
    setError('')
  }

  if (loading) return <p className='text-center mt-4 text-white'>Lädt...</p>

  return (
    <div className='flex justify-center w-full'>
      <div className='w-full max-w-md flex flex-col gap-5 px-4 sm:px-0'>
        <div className='text-center mb-4'>
          <GlowTitle
            text='Wunschliste'
            size='text-5xl sm:text-4xl'
          />
        </div>

        <div className='flex gap-3 items-center justify-center w-full'>
          <StyledButton
            onClick={() => {
              setInput('')
              setLink('')
              setImage(null)
              setPreview(null)
              setEditingIndex(null)
              setOpen(true)
              setError('')
            }}
          />
          <BigButton onClick={() => setChatOpen(true)} />
        </div>

        <div className='flex flex-col gap-4 mt-4'>
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-white/70 text-lg mt-4 text-center max-w-xs italic">
                Noch keine Wünsche✨
              </p>
            </div>
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

        {/* ------------------- POPUP ------------------- */}
        <Dialog open={open} onClose={() => setOpen(false)} className='relative z-50'>
          <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4'>
            
            <Dialog.Panel className='bg-gradient-to-br from-red-900 via-red-800 to-red-900 
              p-5 sm:p-6 rounded-2xl shadow-2xl max-w-sm w-full text-white border border-yellow-400 
              relative z-10 max-h-[90vh] flex flex-col'>

              <Dialog.Title className='text-lg sm:text-xl font-bold mb-4 flex-shrink-0'>
                {editingIndex !== null ? 'Wunsch bearbeiten' : 'Neuer Wunsch'}
              </Dialog.Title>

              <div className='flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3 min-h-0 -mr-1'>
                <div>
                  <textarea
                    placeholder='Wunschtext'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full p-3 rounded-lg bg-red-800/80 border ${error ? 'border-red-500' : 'border-red-500/50'} placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white h-20 resize-none shadow-inner text-base`}
                    style={{ fontSize: '16px' }}
                  />
                  {error && <p className='text-red-300 text-xs mt-1.5'>{error}</p>}
                </div>

                <input
                  type='text'
                  placeholder='Optional: Link'
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className='w-full p-3 rounded-lg bg-red-800/80 border border-red-500/50 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white shadow-inner'
                  style={{ fontSize: '16px' }}
                />

                <label className='flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:via-green-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 touch-manipulation min-h-[44px]'>
                  <ImageIcon fontSize='small' /> 
                  <span className="text-sm sm:text-base">Bild auswählen</span>
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                  />
                </label>

                {preview && (
                  <div className='mt-1'>
                    <img
                      src={preview}
                      alt='Preview'
                      className='rounded-xl w-full object-cover shadow-lg max-h-48 sm:max-h-56'
                    />
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-3 mt-4 pt-4 border-t border-red-700/50 flex-shrink-0'>
                <button
                  onClick={() => setOpen(false)}
                  className='px-4 sm:px-5 py-2.5 rounded-xl font-medium bg-gray-700/80 hover:bg-gray-600 active:scale-[0.97] text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none touch-manipulation min-h-[44px] text-sm sm:text-base'
                  disabled={uploading}
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveItem}
                  disabled={uploading}
                  className='px-4 sm:px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-green-500 via-green-600 to-green-500 hover:via-green-700 active:scale-[0.97] text-white shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 touch-manipulation min-h-[44px] text-sm sm:text-base'
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
      className='relative flex flex-col gap-2 w-full p-4 rounded-2xl border-2 overflow-hidden'
      style={{
        borderColor: '#FFD700',
        boxShadow: '0 0 15px 5px rgba(255,0,0,0.6), 0 0 20px 5px rgba(255,215,0,0.5)',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className='absolute -top-6 -left-6 w-32 h-32 rounded-full bg-red-400/30 blur-3xl animate-pulse pointer-events-none'></div>
      <div className='absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-red-600/30 blur-3xl animate-pulse pointer-events-none'></div>

      <div className='flex justify-between items-start relative z-10 gap-2'>
        <div className='flex-1 min-w-0'>
          <div className='text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-yellow-200 to-red-400 font-semibold break-words'>
            {item.text}
          </div>

          {item.link && (
            <a
              href={item.link}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-1 inline-flex items-center text-yellow-400 hover:text-yellow-200 text-sm font-medium break-all'
            >
              Link <ArrowForwardIcon fontSize='small' className='ml-1' />
            </a>
          )}
        </div>

        <div className='flex flex-shrink-0 gap-1'>
          <button
            onClick={onEdit}
            className='text-yellow-400 hover:text-yellow-200 p-2 rounded-full focus:outline-none shadow-md hover:shadow-lg transition-all duration-200'
          >
            <EditIcon fontSize='small' />
          </button>
          <button
            onClick={onDelete}
            className='text-red-600 hover:text-red-400 p-2 rounded-full focus:outline-none shadow-md hover:shadow-lg transition-all duration-200'
          >
            <DeleteOutlineIcon fontSize='small' />
          </button>
        </div>
      </div>

      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt='Wunschbild'
          className='rounded-xl w-full object-cover mt-2 shadow-md'
        />
      )}
    </motion.div>
  )
}
