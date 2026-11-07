"use client";

import { useEffect, useState } from "react";

function decode(value: string) {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return [...new TextDecoder().decode(bytes)].reverse().join("");
}

function useDecoded(values: string[]) {
  const [decoded, setDecoded] = useState<string[] | null>(null);
  const key = values.join("|");

  useEffect(() => {
    setDecoded(key.split("|").map(decode));
  }, [key]);

  return decoded;
}

export function ProtectedText({ value }: { value: string }) {
  const decoded = useDecoded([value]);
  return <>{decoded ? decoded[0] : "…"}</>;
}

export function ProtectedLines({ values }: { values: string[] }) {
  const decoded = useDecoded(values);
  if (!decoded) return <>…</>;
  return (
    <>
      {decoded.map((line, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export function ProtectedEmail({ value }: { value: string }) {
  const decoded = useDecoded([value]);
  if (!decoded) return <span className="text-gold-soft">…</span>;
  return (
    <a
      href={`mailto:${decoded[0]}`}
      className="text-gold-soft underline-offset-2 hover:underline"
    >
      {decoded[0]}
    </a>
  );
}
