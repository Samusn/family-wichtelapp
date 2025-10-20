import ProtectedRoute from '@auth/ProtectedRoute';
import Header from '@components/Header';
import BottomNav from '@components/BottomNav';
import HomeCardsContainer from './HomeCardsContainer';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen flex flex-col relative">
        <Header />

        <main className="flex-1 mt-24 mb-24 px-6 sm:px-20 flex flex-col gap-10 items-center z-10">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-3">
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-700 drop-shadow-md">
              Weihnachtswichteln 2025
            </h1>
          </div>

          <HomeCardsContainer />
        </main>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
