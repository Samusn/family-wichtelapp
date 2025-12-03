'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { auth } from '@/firebase/authClient'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import {
  sendSecretMessage,
  subscribeToReceivedMessages,
  subscribeToSentMessages,
  markMessageAsRead,
  type SecretMessage,
} from '@/firebase/firestoreClient'
import { useSecretMessages } from './SecretMessageContext'
import SendIcon from '@mui/icons-material/Send'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import MessageIcon from '@mui/icons-material/Message'
import { Badge, Select, MenuItem, FormControl, InputLabel, Tabs, Tab } from '@mui/material'

interface SecretSantaChatProps {
  receiverName: string | null // Die Person, die gezogen wurde (für normale User)
  open: boolean
  setOpen: (open: boolean) => void
}

type TabType = 'toPerson' | 'fromSanta'

export default function SecretSantaChat({
  receiverName,
  open,
  setOpen,
}: SecretSantaChatProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Thread 1: An meine gezogene Person
  const [messagesToPerson, setMessagesToPerson] = useState<SecretMessage[]>([])
  const [unreadToPerson, setUnreadToPerson] = useState(0)
  
  // Thread 2: Von meinem Secret Santa
  const [messagesFromSanta, setMessagesFromSanta] = useState<SecretMessage[]>([])
  const [unreadFromSanta, setUnreadFromSanta] = useState(0)
  
  const [selectedReceiver, setSelectedReceiver] = useState<string>('')
  const [allUsers, setAllUsers] = useState<Array<{ name: string }>>([])
  const [activeTab, setActiveTab] = useState<TabType>('toPerson')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMarkedAsRead = useRef<Set<string>>(new Set())

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            if (userData?.name) {
              setCurrentUserName(userData.name)
            }
            if (userData?.role) {
              setCurrentUserRole(userData.role)
            }
          }
        } catch (error) {
          console.error('Fehler beim Laden des User-Namens:', error)
        }
      } else {
        // Sofort zurücksetzen beim Ausloggen
        setCurrentUserId(null)
        setCurrentUserName('')
        setCurrentUserRole('')
        setMessagesToPerson([])
        setMessagesFromSanta([])
        setUnreadToPerson(0)
        setUnreadFromSanta(0)
      }
    })
    return () => unsubscribe()
  }, [])

  // Empfänger-Liste laden
  useEffect(() => {
    const fetchReceivers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        const allUsersData = snapshot.docs.map((doc) => doc.data())
        const adminUser = allUsersData.find((u) => u.role === 'admin' && u.name)
        const adminName = adminUser?.name || 'Admin'

        if (currentUserRole === 'admin') {
          const users = allUsersData
            .filter((u) => u.name)
            .map((u) => ({ name: u.name }))
          setAllUsers(users)
          if (receiverName) {
            setSelectedReceiver(receiverName)
          } else if (users.length > 0) {
            const admin = users.find((u) => u.name === adminName)
            setSelectedReceiver(admin ? adminName : users[0].name)
          }
        } else if (receiverName) {
          setSelectedReceiver(receiverName)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Empfänger:', error)
      }
    }
    fetchReceivers()
  }, [currentUserRole, receiverName])

  // Thread 1: Nachrichten an gezogene Person (gesendet + Antworten)
  useEffect(() => {
    if (!currentUserId || !currentUserName || !receiverName) {
      setMessagesToPerson([])
      setUnreadToPerson(0)
      return
    }

    let isActive = true
    let sentMessages: SecretMessage[] = []
    let receivedMessages: SecretMessage[] = []

    // Gesendete Nachrichten an die Person
    const unsubscribeSent = subscribeToSentMessages(
      currentUserId,
      (sent) => {
        if (!isActive) return
        sentMessages = sent.filter(m => m.receiverName === receiverName)
        combineThreadMessages()
      }
    )

    // Empfangene Nachrichten von der Person (Antworten)
    const unsubscribeReceived = subscribeToReceivedMessages(
      currentUserName,
      (received) => {
        if (!isActive) return
        receivedMessages = received.filter(m => m.senderName === receiverName)
        combineThreadMessages()
      }
    )

    const combineThreadMessages = () => {
      if (!isActive) return
      const allThreadMessages = [...sentMessages, ...receivedMessages]
        .sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0)
          const timeB = b.timestamp?.toDate?.() || new Date(0)
          return timeA.getTime() - timeB.getTime()
        })
      setMessagesToPerson(allThreadMessages)
      
      // Ungelesene: Antworten von der Person, die ich noch nicht gelesen habe
      const unread = receivedMessages.filter(m => !m.read).length
      setUnreadToPerson(unread)
    }

    return () => {
      isActive = false
      unsubscribeSent()
      unsubscribeReceived()
    }
  }, [currentUserId, currentUserName, receiverName])

  // Thread 2: Nachrichten von Secret Santa (empfangen + meine Antworten)
  useEffect(() => {
    if (!currentUserId || !currentUserName) {
      setMessagesFromSanta([])
      setUnreadFromSanta(0)
      return
    }

    let isActive = true
    let receivedFromSanta: SecretMessage[] = []
    let sentToSanta: SecretMessage[] = []
    let santaName: string | null = null

    const combineSantaThread = () => {
      if (!isActive) return
      // Wenn wir noch keine Nachricht vom Secret Santa haben
      if (receivedFromSanta.length === 0) {
        setMessagesFromSanta([])
        setUnreadFromSanta(0)
        return
      }

      // Kombiniere alle Nachrichten mit Secret Santa
      const allSantaMessages = [...receivedFromSanta, ...sentToSanta]
        .sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0)
          const timeB = b.timestamp?.toDate?.() || new Date(0)
          return timeA.getTime() - timeB.getTime()
        })
      setMessagesFromSanta(allSantaMessages)
      
      // Ungelesene Nachrichten vom Secret Santa
      const unread = receivedFromSanta.filter(m => !m.read).length
      setUnreadFromSanta(unread)
    }

    // Empfangene Nachrichten vom Secret Santa
    const unsubscribeReceived = subscribeToReceivedMessages(
      currentUserName,
      (messages) => {
        if (!isActive) return
        // Nur Nachrichten, die NICHT von der gezogenen Person sind (also vom Secret Santa)
        receivedFromSanta = messages.filter(m => 
          receiverName ? m.senderName !== receiverName : true
        )
        
        // Finde Secret Santa Namen
        if (receivedFromSanta.length > 0 && !santaName) {
          santaName = receivedFromSanta[0].senderName
        }
        
        combineSantaThread()
      }
    )

    // Gesendete Nachrichten an Secret Santa (meine Antworten)
    const unsubscribeSent = subscribeToSentMessages(
      currentUserId,
      (sent) => {
        if (!isActive) return
        // Wenn wir den Secret Santa Namen kennen, filtere nach ihm
        if (santaName) {
          sentToSanta = sent.filter(m => m.receiverName === santaName)
        } else if (receivedFromSanta.length > 0) {
          // Versuche Secret Santa Namen aus empfangenen Nachrichten zu finden
          santaName = receivedFromSanta[0].senderName
          sentToSanta = sent.filter(m => m.receiverName === santaName)
        }
        combineSantaThread()
      }
    )

    return () => {
      isActive = false
      unsubscribeReceived()
      unsubscribeSent()
    }
  }, [currentUserId, currentUserName, receiverName])

  // Automatisch als gelesen markieren, wenn Tab geöffnet wird oder gewechselt wird
  useEffect(() => {
    if (!open || !currentUserName) return

    const markUnreadAsRead = async () => {
      if (activeTab === 'fromSanta') {
        // Markiere alle ungelesenen Nachrichten vom Secret Santa als gelesen
        const unreadMessages = messagesFromSanta.filter(
          m => !m.read && m.receiverName === currentUserName && m.id
        )
        for (const msg of unreadMessages) {
          if (msg.id && !hasMarkedAsRead.current.has(msg.id)) {
            try {
              await markMessageAsRead(msg.id)
              hasMarkedAsRead.current.add(msg.id)
            } catch (error) {
              console.error('Fehler beim Markieren als gelesen:', error)
            }
          }
        }
      } else if (activeTab === 'toPerson' && receiverName) {
        // Markiere alle ungelesenen Antworten von der gezogenen Person als gelesen
        const unreadMessages = messagesToPerson.filter(
          m => !m.read && m.senderName === receiverName && m.receiverName === currentUserName && m.id
        )
        for (const msg of unreadMessages) {
          if (msg.id && !hasMarkedAsRead.current.has(msg.id)) {
            try {
              await markMessageAsRead(msg.id)
              hasMarkedAsRead.current.add(msg.id)
            } catch (error) {
              console.error('Fehler beim Markieren als gelesen:', error)
            }
          }
        }
      }
    }

    // Führe sofort aus, wenn Nachrichten vorhanden sind, sonst warte kurz
    if ((activeTab === 'fromSanta' && messagesFromSanta.length > 0) ||
        (activeTab === 'toPerson' && messagesToPerson.length > 0)) {
      markUnreadAsRead()
    } else {
      // Warte kurz, damit die Nachrichten geladen sind
      const timeout = setTimeout(() => {
        markUnreadAsRead()
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [open, activeTab, messagesFromSanta, messagesToPerson, currentUserName, receiverName])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesToPerson, messagesFromSanta, loading, activeTab])

  const sendMessage = async () => {
    const messageText = input.trim()
    let targetReceiver: string | null = null
    
    if (activeTab === 'toPerson') {
      // Tab "An meine Person": Sende an gezogene Person
      targetReceiver = selectedReceiver || receiverName
    } else if (activeTab === 'fromSanta') {
      // Tab "Von Secret Santa": Antworte an Secret Santa
      if (messagesFromSanta.length > 0) {
        targetReceiver = messagesFromSanta[0].senderName
      } else {
        alert('Keine Nachricht vorhanden, auf die geantwortet werden kann')
        return
      }
    }
    
    if (!messageText || !targetReceiver || !currentUserId || !currentUserName)
      return

    setInput('')
    setLoading(true)

    try {
      await sendSecretMessage(
        currentUserId,
        currentUserName,
        targetReceiver,
        messageText
      )
      
      // Wenn geantwortet wurde, markiere alle Nachrichten des Threads als gelesen
      if (activeTab === 'fromSanta' && messagesFromSanta.length > 0) {
        const santaName = messagesFromSanta[0].senderName
        const unreadMessages = messagesFromSanta.filter(
          m => !m.read && m.senderName === santaName && m.id
        )
        for (const msg of unreadMessages) {
          if (msg.id && !hasMarkedAsRead.current.has(msg.id)) {
            try {
              await markMessageAsRead(msg.id)
              hasMarkedAsRead.current.add(msg.id)
            } catch (error) {
              console.error('Fehler beim Markieren als gelesen:', error)
            }
          }
        }
      }
      
      // Wenn an gezogene Person geantwortet wurde, markiere ihre Antworten als gelesen
      if (activeTab === 'toPerson' && receiverName) {
        const unreadFromPerson = messagesToPerson.filter(
          m => !m.read && m.senderName === receiverName && m.receiverName === currentUserName && m.id
        )
        for (const msg of unreadFromPerson) {
          if (msg.id && !hasMarkedAsRead.current.has(msg.id)) {
            try {
              await markMessageAsRead(msg.id)
              hasMarkedAsRead.current.add(msg.id)
            } catch (error) {
              console.error('Fehler beim Markieren als gelesen:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error)
      alert('Fehler beim Senden der Nachricht')
    } finally {
      setLoading(false)
    }
  }

  // Für normale User: nur anzeigen wenn receiverName vorhanden
  // Für Admins: immer anzeigen
  const shouldShow = currentUserRole === 'admin' || receiverName !== null

  if (!shouldShow) return null

  const displayReceiver = selectedReceiver || receiverName
  const currentMessages = activeTab === 'toPerson' ? messagesToPerson : messagesFromSanta
  const currentUnread = activeTab === 'toPerson' ? unreadToPerson : unreadFromSanta

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 sm:right-8 z-40 bg-red-600 hover:bg-red-700 text-yellow-300 rounded-full p-4 shadow-lg border-2 border-yellow-400 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Badge badgeContent={unreadToPerson + unreadFromSanta} color="error">
          <MessageIcon sx={{ fontSize: 28 }} />
        </Badge>
      </motion.button>

      {/* Chat Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-2">
          <Dialog.Panel
            className="
              bg-red-900
              rounded-2xl
              shadow-2xl
              w-full
              max-w-[480px]
              h-[600px]
              flex flex-col
              overflow-hidden
              border-2 border-yellow-400
            "
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-yellow-400">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-yellow-300">
                  🎅 Secret Santa Nachricht
                </h2>
                {currentUserRole === 'admin' && allUsers.length > 0 ? (
                  <FormControl size="small" sx={{ mt: 1, minWidth: 200 }}>
                    <InputLabel sx={{ color: '#FFD700' }}>Empfänger</InputLabel>
                    <Select
                      value={selectedReceiver}
                      onChange={(e) => setSelectedReceiver(e.target.value)}
                      label="Empfänger"
                      sx={{
                        color: '#FFD700',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFD700',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#FFFF66',
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#FFD700',
                        },
                      }}
                    >
                      {allUsers.map((user) => (
                        <MenuItem key={user.name} value={user.name}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <p className="text-sm text-yellow-200/80 mt-1">
                    {activeTab === 'toPerson' 
                      ? `An: ${displayReceiver}`
                      : `Von: Secret Santa`
                    }
                  </p>
                )}
              </div>
              <IconButton
                onClick={() => setOpen(false)}
                sx={{
                  color: '#FFD700',
                  '&:hover': {
                    color: '#FFFF66',
                    backgroundColor: 'rgba(255,255,0,0.2)',
                  },
                  p: 1,
                }}
                size="large"
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </div>

            {/* Tabs */}
            <div className="border-b border-yellow-400">
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => {
                  setActiveTab(newValue)
                  setInput('') // Input leeren beim Tab-Wechsel
                }}
                sx={{
                  '& .MuiTab-root': {
                    color: '#FFD700',
                    '&.Mui-selected': {
                      color: '#FFFF66',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#FFD700',
                  },
                }}
              >
                <Tab 
                  label={
                    <span>
                      Wichtelopfer
                      {unreadToPerson > 0 && (
                        <Badge badgeContent={unreadToPerson} color="error" sx={{ ml: 1 }}>
                          <span style={{ width: 0, height: 0 }}></span>
                        </Badge>
                      )}
                    </span>
                  } 
                  value="toPerson" 
                />
                <Tab 
                  label={
                    <span>
                      SecretSanta
                      {unreadFromSanta > 0 && (
                        <Badge badgeContent={unreadFromSanta} color="error" sx={{ ml: 1 }}>
                          <span style={{ width: 0, height: 0 }}></span>
                        </Badge>
                      )}
                    </span>
                  } 
                  value="fromSanta" 
                />
              </Tabs>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-2 overflow-y-auto p-3 bg-red-800 flex-1">
              {currentMessages.length === 0 ? (
                <div className="text-center text-yellow-200/60 py-8">
                  <p>
                    {activeTab === 'toPerson' 
                      ? 'Noch keine Nachrichten an diese Person'
                      : 'Noch keine Nachrichten vom Secret Santa'
                    }
                  </p>
                </div>
              ) : (
                currentMessages.map((msg, i) => {
                  const isSent = msg.senderId === currentUserId || msg.senderName === currentUserName
                  
                  return (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl break-words max-w-[85%] ${
                        isSent
                          ? 'bg-yellow-400 text-red-900 self-end'
                          : 'bg-yellow-200 text-red-900 self-start'
                      }`}
                    >
                      {!isSent && activeTab === 'fromSanta' && (
                        <div className="text-xs text-red-700/70 mb-1">
                          Von deinem Secret Santa
                        </div>
                      )}
                      {isSent && activeTab === 'toPerson' && (
                        <div className="text-xs text-red-900/70 mb-1">
                          An: {msg.receiverName}
                        </div>
                      )}
                      {!isSent && activeTab === 'toPerson' && (
                        <div className="text-xs text-red-700/70 mb-1">
                          Von: {msg.senderName}
                        </div>
                      )}
                      <div>{msg.message}</div>
                      {msg.timestamp && (
                        <div className={`text-xs mt-1 ${
                          isSent ? 'text-red-900/50' : 'text-red-700/50'
                        }`}>
                          {msg.timestamp.toDate
                            ? new Date(msg.timestamp.toDate()).toLocaleString('de-DE')
                            : ''}
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}

              {loading && (
                <motion.div
                  className="flex gap-2 self-end p-2 bg-yellow-400 text-red-900 rounded-xl max-w-[40%]"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  <span>Sende...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-yellow-400 bg-red-800">
              <div className="text-xs text-yellow-200/60 mb-2 px-1">
                {activeTab === 'toPerson'
                  ? `Sende eine Nachricht an ${displayReceiver}`
                  : `Antworte deinem Secret Santa`
                }
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={activeTab === 'toPerson' ? "Deine Nachricht..." : "Deine Antwort..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  className="flex-grow p-3 rounded-xl bg-red-900 text-yellow-100 border border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  style={{ fontSize: '16px' }}
                  disabled={
                    loading || 
                    (activeTab === 'toPerson' && !selectedReceiver && !receiverName) ||
                    (activeTab === 'fromSanta' && messagesFromSanta.length === 0)
                  }
                />
                <button
                  onClick={sendMessage}
                  disabled={
                    loading || 
                    !input.trim() || 
                    (activeTab === 'toPerson' && !selectedReceiver && !receiverName) ||
                    (activeTab === 'fromSanta' && messagesFromSanta.length === 0)
                  }
                  className="bg-yellow-400 text-red-900 px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-300 transition-colors"
                >
                  {loading ? '…' : <SendIcon />}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
