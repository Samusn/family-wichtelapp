import Image from 'next/image';
import Link from 'next/link';
import '@components/background.css';
import LogoutButton from '@components/LogoutBtn';
import ProtectedRoute from '@auth/ProtectedRoute';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header'

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className='background font-sans grid grid-rows-[20px_1fr_20px] min-h-screen items-center justify-items-center p-8 pb-20 gap-16 sm:p-20'>
        <div className='fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-green-600 via-green-600 to-transparent z-40' />

       <Header /> 

        <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'></main>

        <footer className='row-start-3 flex gap-[24px] flex-wrap items-center justify-center'></footer>
      </div>
    </ProtectedRoute>
  );
}
