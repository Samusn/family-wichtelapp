import Link from 'next/link'
import GlowTitle from '@components/GlowTitle'
import Countdown from '@components/Countdown'
import SantaLottie from '@components/SantaLottie'

export default function IndexPage() {
  return (
    <main className='flex flex-col items-center justify-center min-h-screen p-8 gap-10'>
      <GlowTitle
        text='Frohes Wichteln!'
        size='text-5xl sm:text-5xl'
        color='#FFD700'
        shadowColor='#FFEE88'
      />
      <div className='w-[300px]'>
        <SantaLottie />
      </div>
      <Countdown variant='boxed' />
      <Link
        href='/login'
        className='inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-semibold w-[85%] px-6 py-3 text-lg rounded-2xl shadow-lg transition-all hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-center'
      >
        Hier geht’s weiter →
      </Link>
    </main>
  )
}
