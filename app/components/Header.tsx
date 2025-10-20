'use client';

import React from 'react';
import Countdown from '@components/Countdown';

export default function Header() {
  return (
    <header className="top-0 left-0 right-0 z-50 flex flex-col items-center">
      <div className="p-4 flex items-center justify-center w-full">
        <Countdown variant="plain" />
      </div>
    </header>
  );
}

