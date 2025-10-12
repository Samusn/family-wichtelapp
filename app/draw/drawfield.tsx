'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CloseIcon from '@mui/icons-material/Close';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function DrawField() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawn, setDrawn] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // 🔹 Aktuell eingeloggten User holen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        // Prüfen, ob schon gezogen
        const drawRef = doc(db, 'draws', user.uid);
        const drawSnap = await getDoc(drawRef);
        if (drawSnap.exists()) {
          setDrawn(drawSnap.data().drawnName);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Teilnehmer laden (nur role=user)
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs
          .map((doc) => doc.data() as UserData)
          .filter((u) => u.role === 'user');
        setParticipants(users);
      } catch (error) {
        console.error('Fehler beim Laden der Teilnehmer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // 🔹 Ziehung starten
  const handleDraw = async () => {
    if (!currentUserId || animating || drawn) return;
    if (participants.length <= 1) {
      alert('Zu wenige Teilnehmer zum Ziehen. Wende dich an Samuel 😅');
      return;
    }

    const available = participants.filter((p) => p.name !== auth.currentUser?.displayName);
    if (available.length === 0) {
      alert('Alle Teilnehmer wurden bereits gezogen. Wende dich an Samuel 😅');
      return;
    }

    setAnimating(true);
    setDrawn(null);

    let iterations = 25;
    let random: UserData | null = null;

    const interval = setInterval(() => {
      random = available[Math.floor(Math.random() * available.length)];
      setHighlight(random.name);
      iterations--;

      if (iterations <= 0) {
        clearInterval(interval);
        setHighlight(null);
        setAnimating(false);
        setShowPopup(true);
        setDrawn(random!.name);
        saveDraw(currentUserId, random!.name);
      }
    }, 100);
  };

  // 🔹 Speichern des gezogenen Loses
  const saveDraw = async (userId: string, drawnName: string) => {
    try {
      const drawRef = doc(db, 'draws', userId);
      await setDoc(drawRef, { drawnName }, { merge: true });
    } catch (error) {
      console.error('Fehler beim Speichern des Loses:', error);
    }
  };

  return (
    <div className="flex justify-center w-full mt-6 relative min-h-[400px]">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 z-10">
        <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <CardGiftcardIcon /> Los ziehen
        </h2>

        {loading ? (
          <p className="text-gray-500 text-sm">Lade Teilnehmer...</p>
        ) : !drawn ? (
          <>
            <div className="w-full h-32 flex items-center justify-center border-2 border-red-300 rounded-xl text-gray-800 text-lg font-semibold">
              {highlight || '---'}
            </div>

            <button
              onClick={handleDraw}
              disabled={animating}
              className="mt-6 flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-full shadow-md hover:bg-red-700 active:scale-95 transition-transform font-bold text-lg disabled:opacity-50"
            >
              <ShuffleIcon /> Ziehen
            </button>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-xl font-semibold text-gray-800">🎉 Du hast gezogen:</p>
            <p className="text-4xl font-extrabold text-red-600">{drawn}</p>
          </div>
        )}
      </div>

      {showPopup && drawn && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-4 w-72">
            <button
              onClick={() => setShowPopup(false)}
              className="self-end text-gray-400 hover:text-gray-600"
            >
              <CloseIcon />
            </button>
            <CardGiftcardIcon className="text-red-600 w-12 h-12" fontSize="large" />
            <p className="text-center text-gray-900 font-semibold text-lg">
              🎉 Gezogen: <span className="text-red-600">{drawn}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
