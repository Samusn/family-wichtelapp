import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@auth/ProtectedRoute";
import Header from "@components/Header";
import BottomNav from "@components/BottomNav";
import ParticipantList from "./participantList";

export default function ParticipantPage() {
  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen flex flex-col relative">
        <main className="flex-1 mt-20 mb-20 p-8 sm:p-20 flex flex-col gap-8 items-center justify-center z-10">
          <ParticipantList />
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
