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

  if (loading) return <p className="text-center text-gray-500">Lädt Teilnehmer...</p>;

  return (
    <ul className="max-w-3xl w-full bg-white rounded-xl shadow divide-y divide-gray-200 p-4">
      {participants.map((user) => (
        <li key={user.id}>
          <Link
            href={`/participant/${user.id}`}
            className="flex items-center p-4 rounded hover:bg-green-100 transition"
          >
            <PersonIcon className="text-red-600 w-6 h-6 mr-3" />
            <span className="text-lg font-medium text-red-600">{user.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
