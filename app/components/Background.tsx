import Image from "next/image";
import Lights from "./Lights";
import Snowfall from "./Snowfall";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <Image
        src="/images/wichtel-room.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_70%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/55 to-night/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(248_201_74/0.18),transparent_60%)]" />
      <Snowfall />
      <Lights
        count={14}
        className="absolute inset-x-0 top-[env(safe-area-inset-top)] -mt-1"
      />
    </div>
  );
}
