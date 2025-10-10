'use client';
import React from 'react';
import Countdown from '@components/Countdown';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-center bg-transparent">
      {/* Countdown plain variante (nur Text) */}
      <Countdown variant="plain" />
    </header>
  );
}
