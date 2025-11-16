"use client";
import Link from "next/link";
import React from "react";

interface HomeCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  bgColor?: string;
}

export default function HomeCard({
  title,
  description,
  href,
  icon,
  bgColor = "bg-green-100",
}: HomeCardProps) {
  return (
    <Link href={href} className="w-full sm:w-80">
      <div
        className={`flex flex-col items-start p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-transform ${bgColor}`}
      >
        <div className="w-12 h-12 flex items-center justify-center text-white text-2xl rounded-full mb-4 bg-red-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
