"use client";
import React, { memo } from "react";
import { Mountains_of_Christmas } from "next/font/google";

const mountains = Mountains_of_Christmas({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mountains"
});

interface GlowTitleProps {
  text: string;
  size?: string;
  className?: string;
}

const GlowTitle = memo(function GlowTitle({
  text,
  size = "text-3xl",
  className = "",
}: GlowTitleProps) {
  return (
    <h1
      className={`${size} font-extrabold relative ${mountains.variable} ${className}`}
      style={{
        fontFamily: "var(--font-mountains)",
        background: "linear-gradient(90deg, #ffe066 20%, #33ff66 50%, #ffe066 60%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shine 4s linear infinite",
        textShadow: `
          0 0 15px rgba(255, 220, 100, 0.7),
          0 0 25px rgba(255, 180, 50, 0.6),
          0 0 35px rgba(255, 140, 0, 0.5),
          0 0 50px rgba(255, 120, 0, 0.4)
        `,
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>
    </h1>
  );
})

export default GlowTitle
