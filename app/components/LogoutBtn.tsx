'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/firebase/auth';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout fehlgeschlagen', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className='text-red-600 px-4 py-2 rounded hover:bg-red-700 transition'
    >
     <LogoutIcon /> 
    </button>
  );
}
