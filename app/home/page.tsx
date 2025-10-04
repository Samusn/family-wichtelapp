import Image from "next/image";
import Link from "next/link";
import "@components/background.css";
import LogoutButton from "@components/LogoutBtn";
import ProtectedRoute from "@auth/ProtectedRoute";
import Sidebar from "@components/Sidebar";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="background font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="grid grid-cols-3 items-center p-4 fixed top-0 left-0 right-0 z-50">
            <div className="justify-self-start">
              <Sidebar />
            </div>
            <div className="justify-self-center">
              <h1 className="text-lg font-bold">My App</h1>
            </div>
            <div className="justify-self-end">
              <LogoutButton />
            </div>
          </div>

          <h1>Login successfully</h1>
        </main>

        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
