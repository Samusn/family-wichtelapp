"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@components/LocationMap"), {
  ssr: false,
});

export default function LocationMapLoader() {
  return <LocationMap />;
}
