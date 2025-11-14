import Image from 'next/image'
import Link from 'next/link'
import ProtectedRoute from '@auth/ProtectedRoute'
import Header from '@components/Header'
import BottomNav from '@components/BottomNav'
import DrawField from './drawfield.tsx'
import bgImage from '@components/wichtel_room.jpg'

export default function DrawPage() {
  return (
    <ProtectedRoute>
      <div className="font-sans w-screen h-screen flex flex-col relative overflow-hidden">
        {/* Hintergrundbild 
          <Image
            src={bgImage}
            alt="Wichtel Room Background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            quality={80}
            className="brightness-50"
          />
        </div>
        */}

        {/* Hauptinhalt */}
        <main className="flex-1 w-full h-full mt-24 px-6 sm:px-20 flex flex-col gap-10 items-center relative z-10">
          <DrawField />
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}
