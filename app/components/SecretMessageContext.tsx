'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/authClient'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { subscribeToReceivedMessages, type SecretMessage } from '@/firebase/firestoreClient'

interface SecretMessageContextType {
  unreadCount: number
}

const SecretMessageContext = createContext<SecretMessageContextType>({
  unreadCount: 0,
})

export function SecretMessageProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Auth check & User Name laden
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true)
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            if (userData?.name) {
              setCurrentUserName(userData.name)
            }
          }
        } catch (error) {
          console.error('Fehler beim Laden des User-Namens:', error)
          setCurrentUserName('')
        }
      } else {
        // Sofort alle State zurücksetzen, wenn ausgeloggt
        setIsAuthenticated(false)
        setCurrentUserName('')
        setUnreadCount(0)
      }
    })
    return () => unsubscribe()
  }, [])

  // Real-time Nachrichten für ungelesene Count
  useEffect(() => {
    // Sofort stoppen, wenn nicht authentifiziert oder kein Name
    if (!isAuthenticated || !currentUserName) {
      setUnreadCount(0)
      return
    }

    let isActive = true

    const unsubscribe = subscribeToReceivedMessages(
      currentUserName,
      (messages: SecretMessage[]) => {
        // Nur aktualisieren, wenn noch aktiv
        if (isActive) {
          const unread = messages.filter((m) => !m.read).length
          setUnreadCount(unread)
        }
      }
    )

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [currentUserName, isAuthenticated])

  return (
    <SecretMessageContext.Provider value={{ unreadCount }}>
      {children}
    </SecretMessageContext.Provider>
  )
}

export function useSecretMessages() {
  return useContext(SecretMessageContext)
}
