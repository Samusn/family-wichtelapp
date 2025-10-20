'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import PersonIcon from '@mui/icons-material/Person';

interface UserData {
  id: string;
  name: string;
  role: string;
}

export default function ParticipantList() {
  const [participants, setParticipants] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'user'));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as UserData),
        }));
        setParticipants(users);
      } catch (err) {
        console.error('Fehler beim Laden der Teilnehmer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-red-600"></div>
      </div>
    );

  if (participants.length === 0)
    return <p className="text-center text-red-600 mt-4">Keine Teilnehmer gefunden.</p>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto mt-4">
      {participants.map((user, index) => (
        <Link key={user.id} href={`/participant/${user.id}`}>
          <div className="relative flex items-center p-4 bg-red-50 rounded-xl shadow-lg overflow-hidden">
            {/* 3D-Lichter-Rand */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent animate-lights z-0"></div>

            <PersonIcon className="text-red-600 w-6 h-6 mr-3 z-10" />
            <span className="text-red-600 font-bold text-lg z-10">{user.name}</span>
          </div>
        </Link>
      ))}

      <style jsx>{`
        @keyframes lights {
          0% {
            box-shadow:
              0 0 8px #ff0000, 0 0 6px #ff0000 inset,
              0 0 4px #ffa500, 0 0 3px #ffa500 inset;
          }
          25% {
            box-shadow:
              0 0 10px #ff0, 0 0 8px #ff0 inset,
              0 0 5px #ff4500, 0 0 4px #ff4500 inset;
          }
          50% {
            box-shadow:
              0 0 12px #0f0, 0 0 10px #0f0 inset,
              0 0 6px #adff2f, 0 0 5px #adff2f inset;
          }
          75% {
            box-shadow:
              0 0 10px #ffa500, 0 0 8px #ffa500 inset,
              0 0 5px #ff6347, 0 0 4px #ff6347 inset;
          }
          100% {
            box-shadow:
              0 0 8px #ff0000, 0 0 6px #ff0000 inset,
              0 0 4px #ffa500, 0 0 3px #ffa500 inset;
          }
        }

        .animate-lights {
          animation: lights 2s linear infinite;
          border-radius: 1rem;
        }
      `}</style>
    </div>
  );
}
