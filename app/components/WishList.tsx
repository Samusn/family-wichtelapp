'use client';

import React, { useState } from 'react';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

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
    <div className="flex justify-center w-full">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-5 text-red-600 flex items-center justify-center gap-2">
          <GiftIcon fontSize="medium" className="text-red-600" /> Wunschliste
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Wunsch hinzufügen..."
            className="flex-1 p-3 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400"
          />
          <button
            onClick={addItem}
            className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-center text-gray-500 italic">
              Noch keine Wünsche ✨
            </p>
          )}

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-green-50 border-l-4 border-green-500 p-3 rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
            >
              <span className="text-gray-900 font-medium truncate">{item}</span>
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700 active:scale-90 transition-transform"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
