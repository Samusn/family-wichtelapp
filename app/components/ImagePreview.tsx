"use client";

import { useRef } from "react";

export default function ImagePreview({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => dialogRef.current?.showModal()}
        className="w-14 h-14 shrink-0 rounded-2xl object-cover border border-white/12 cursor-pointer"
      />
      <dialog
        ref={dialogRef}
        onClick={() => dialogRef.current?.close()}
        className="fixed inset-0 m-auto max-w-[90vw] max-h-[90vh] rounded-2xl bg-transparent backdrop:bg-black/70 p-0"
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] rounded-2xl object-contain"
        />
      </dialog>
    </>
  );
}
