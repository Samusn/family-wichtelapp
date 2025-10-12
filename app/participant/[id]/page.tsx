'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import ProtectedRoute from '@auth/ProtectedRoute';
import Header from '@components/Header';
import BottomNav from '@components/BottomNav';
import '@components/background.css';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserWishlist(props: PageProps) {
  const { id } = use(props.params);
  const router = useRouter();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setUserName('Unbekannter User');
          setWishlist([]);
          return;
        }
        const userData = userSnap.data();
        setUserName(userData.name || 'User');

        const wishlistRef = doc(db, 'wishlist', id);
        const wishlistSnap = await getDoc(wishlistRef);
        setWishlist(wishlistSnap.exists() ? wishlistSnap.data().items || [] : []);
      } catch (err) {
        console.error('Fehler beim Laden der Wishlist:', err);
        setUserName('Unbekannter User');
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [id]);

  return (
    <ProtectedRoute>
      <div className="background font-sans min-h-screen flex flex-col relative">
        <Header />
        <main className="flex-1 mt-20 mb-20 p-8 sm:p-20 flex flex-col gap-8 items-start justify-start z-10 w-full max-w-3xl mx-auto">
          {loading ? (
            <p className="text-center text-gray-500 w-full">Lädt...</p>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-6 text-red-600 text-left w-full">
                {userName}’s Wünsche
              </h2>
              {wishlist.length === 0 ? (
                <p className="text-white italic mb-10 w-full">Noch keine Wünsche vorhanden ✨</p>
              ) : (
                <ul className="bg-white rounded-xl shadow divide-y divide-gray-200 p-4 w-full mb-10">
                  {wishlist.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center p-3 hover:bg-green-50 rounded transition"
                    >
                      <CardGiftcardIcon className="text-red-500 w-5 h-5 mr-3" />
                      <span className="text-gray-900 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Zurück Button unterhalb der Liste */}
              <button
                onClick={() => router.push('/participant')}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 active:scale-95 transition-transform font-medium mb-10"
              >
                &larr; Zurück zur Teilnehmerliste
              </button>
            </>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
