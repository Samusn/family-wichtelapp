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
      className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-red-700 active:scale-95 transition-transform font-medium"
    >
      <LogoutIcon fontSize="medium" />
      Abmelden
    </button>
  );
}

