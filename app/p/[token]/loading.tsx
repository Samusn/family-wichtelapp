"use client";

import Animation from "@components/ui/Animation";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-48 h-48">
        <Animation name="reindeer" />
      </div>
    </div>
  );
}
