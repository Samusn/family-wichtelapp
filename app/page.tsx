import Image from "next/image";
import Link from "next/link";
import santaImg from "@images/santa.png";
import Countdown from "@components/Countdown";

export default function IndexPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start relative z-10">
        <Image src={santaImg} alt="Santa Image" width={300} priority />
        <Countdown variant="boxed" />

        <Link
          href="/login"
          className="inline-block bg-red-600 text-white font-semibold w-[85%] px-6 py-3 text-lg rounded-lg shadow-lg transition duration-300 text-center"
        >
          Hier geht’s weiter →
        </Link>
      </main>
    </div>
  );
}
