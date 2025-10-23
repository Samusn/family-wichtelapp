"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/firebase/auth";
import LogoutIcon from "@mui/icons-material/Logout";

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export default function LogoutButton({
  className,
  label = "Abmelden",
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout fehlgeschlagen", err);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      <LogoutIcon className="mr-2" /> {label}
    </button>
  );
}
