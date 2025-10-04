'use client';
import React from 'react';
import Sidebar from '@components/Sidebar';
import LogoutButton from '@components/LogoutBtn';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = 'Family Wichtel' }: HeaderProps) {
  return (
    <header className='fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-center bg-transparent'>
      {/* Linke Buttons */}
      <div className='absolute left-6 flex items-center'>
        <Sidebar />
      </div>

      {/* Titel */}
      <h1 className='text-lg font-bold text-red-600 text-center truncate'>
        {title}
      </h1>

      {/* Rechte Buttons */}
      <div className='absolute right-4 flex items-center'>
        <LogoutButton />
      </div>
    </header>
  );
}
