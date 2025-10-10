'use client';

import LogoutButton from '@components/LogoutBtn';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function BottomSheet({ open, onClose }: BottomSheetProps) {
  return (
    <>
      {open && (
        <div
          className='fixed inset-0 bg-black/25 z-55'
          onClick={onClose}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-60 bg-white rounded-t-3xl shadow-xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className='flex justify-end p-4'>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-700'
          >
            <CloseIcon fontSize='medium' />
          </button>
        </div>

        <div className='flex flex-col w-full gap-3 p-6'>
          <button className='flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition font-medium text-gray-900'>
            <PersonIcon className='text-indigo-600' /> Profil
          </button>

          <button className='flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 transition font-medium text-gray-900'>
            <SettingsIcon className='text-indigo-600' /> Einstellungen
          </button>

          <div className='border-t border-gray-200 my-3' />

          <div className='w-full'>
            <LogoutButton
              className='w-full bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition font-medium flex justify-center items-center'
              label='Abmelden'
            />
          </div>
        </div>
      </div>
    </>
  );
}

