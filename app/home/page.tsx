import ProtectedRoute from "@auth/ProtectedRoute"
import BottomNav from "@components/BottomNav"
import HomeCardsContainer from "./HomeCardsContainer"
import GlowTitle from "@components/GlowTitle"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen flex flex-col relative">
        <main className="flex-1 mt-24 px-6 sm:px-20 pb-40 flex flex-col gap-10 items-center z-10 min-h-[100vh]">
          <div className="text-center">
            <GlowTitle
              text="Weihnachtswichteln 2025"
              size="text-4xl sm:text-5xl"
              color="#00a000"
              shadowColor="#99ff66"
            />
          </div>

          <HomeCardsContainer />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  )
}
