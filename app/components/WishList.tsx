'use client';

import React, { useState } from 'react';

export default function WishList() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addItem = () => {
    if (input.trim() === '') return;
    setItems([...items, input.trim()]);
    setInput('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className='p-4 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold text-center mb-4 text-red-600'>
        Wunschliste
      </h1>

      <div className='flex gap-2 mb-4'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Wunsch hinzufügen...'
          className='flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
        />
        <button
          onClick={addItem}
          className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition'
        >
          +
        </button>
      </div>

      <div className='space-y-2'>
        {items.length === 0 && (
          <p className='text-center text-gray-500'>Noch keine Wünsche ✨</p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className='flex justify-between items-center bg-green-100 border-l-4 border-green-500 p-2 rounded-lg transition transform hover:scale-[1.02]'
          >
            <span className='text-sm font-semibold text-gray-800 truncate'>
              {item}
            </span>
            <button
              onClick={() => removeItem(index)}
              className='text-red-600 hover:text-red-800 text-sm font-bold'
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
