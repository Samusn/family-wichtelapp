'use client'

import Image from 'next/image';
import Link from 'next/link';
import '@components/background.css';
import LogoutButton from '@components/LogoutBtn';
import ProtectedRoute from '@auth/ProtectedRoute';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';
import BottomNav from '@components/BottomNav';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="background font-sans min-h-screen flex flex-col relative">
        <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-green-600 via-green-600 to-transparent z-40" />
        <Header />
        <main className="flex-1 mt-20 mb-20 p-8 sm:p-20 flex flex-col gap-8 items-center sm:items-start z-10">
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}

