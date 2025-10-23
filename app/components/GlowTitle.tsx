"use client";
import React from "react";

interface GlowTitleProps {
  text: string;
  color?: string;
  size?: string;
  shadowColor?: string;
  className?: string;
}

export default function GlowTitle({
  text,
  color = "#00a000",
  size = "text-3xl",
  shadowColor = "#00ff00",
  className = "",
}: GlowTitleProps) {
  return (
    <h1
      className={`${size} font-extrabold ${className}`}
      style={{
        color: color,
        textShadow: `
          0 0 3px ${shadowColor},
          0 0 6px ${shadowColor},
          0 0 10px ${shadowColor}
        `,
      }}
    >
      {text}
    </h1>
  );
}
