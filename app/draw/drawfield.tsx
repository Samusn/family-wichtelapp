'use client';

import { useState } from 'react';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CloseIcon from '@mui/icons-material/Close';

export default function DrawField() {
  const participants = ['Samuel', 'Deborah', 'Jedidija', 'Lea', 'Wathey', 'Darun'];
  const [drawn, setDrawn] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const handleDraw = () => {
    setAnimating(true);
    setDrawn(null);

    let iterations = 20;
    const interval = setInterval(() => {
      const random = participants[Math.floor(Math.random() * participants.length)];
      setHighlight(random);
      iterations--;

      if (iterations <= 0) {
        clearInterval(interval);
        setDrawn(random);
        setHighlight(null);
        setAnimating(false);
        setShowPopup(true);
      }
    }, 100);
  };

  // Teilnehmer zufällig sortieren
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);

  return (
    <div className='flex justify-center w-full mt-6 relative'>
      <div className='w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 z-10'>
        <h2 className='text-xl font-bold text-red-600 flex items-center gap-2'>
          <CardGiftcardIcon /> Los ziehen
        </h2>

        <div className='w-full flex flex-col gap-3 overflow-hidden h-[250px]'>
          {shuffledParticipants.map((p, index) => (
            <div
              key={p}
              className={`p-3 rounded-xl shadow-sm flex items-center justify-between font-medium transition-transform ${
                highlight === p
                  ? 'bg-red-500 text-white scale-105'
                  : drawn === p
                  ? 'bg-red-200 text-gray-900 scale-105'
                  : 'bg-green-50 text-gray-900'
              }`}
              style={{
                display: index < 5 ? 'flex' : 'none', // nur die ersten 5 sichtbar
              }}
            >
              <span className={`${drawn === p ? 'font-bold' : ''}`}>{p}</span>
              {drawn === p && !highlight && <CardGiftcardIcon className='text-red-500' />}
            </div>
          ))}
        </div>

        <button
          onClick={handleDraw}
          disabled={animating}
          className='mt-4 flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-red-700 active:scale-95 transition-transform font-medium disabled:opacity-50'
        >
          <ShuffleIcon />
          Ziehen
        </button>
      </div>

      {showPopup && drawn && (
        <div className='absolute inset-0 bg-black/30 flex items-center justify-center z-20'>
          <div className='bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-4 w-72'>
            <button
              onClick={() => setShowPopup(false)}
              className='self-end text-gray-400 hover:text-gray-600'
            >
              <CloseIcon />
            </button>
            <CardGiftcardIcon className='text-red-600 w-12 h-12' fontSize='large' />
            <p className='text-center text-gray-900 font-semibold text-lg'>
              🎉 Du hast <span className='text-red-600'>{drawn}</span> gezogen!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
