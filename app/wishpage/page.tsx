import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@auth/ProtectedRoute";
import WishList from "@components/WishList";
import Header from "@components/Header";
import BottomNav from "@components/BottomNav";

export default function WishPage() {
  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen flex flex-col relative">
        <main className="flex-1 mt-24 px-6 sm:px-20 pb-40 flex flex-col gap-10 items-center z-10 min-h-[100vh]">
          <div className="w-full max-w-sm">
            <WishList />
          </div>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
