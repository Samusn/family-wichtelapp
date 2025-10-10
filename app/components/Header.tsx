'use client';
import React from 'react';
import Countdown from '@components/Countdown';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center">
      {/* Hintergrund-Gradient */}
      <div className="absolute top-0 left-0 right-0 h-25 bg-gradient-to-b from-green-600 via-green-600 to-transparent -z-10" />

      {/* Header Content */}
      <div className="p-4 flex items-center justify-center w-full">
        <Countdown variant="plain" />
      </div>
    </header>
  );
}

