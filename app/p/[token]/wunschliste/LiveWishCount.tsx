"use client";

import { createContext, useContext, useState } from "react";
import WishStats from "@components/WishStats";

const LikesContext = createContext<{
  likes: number;
  setLikes: (likes: number) => void;
}>({ likes: 0, setLikes: () => {} });

export function LikesProvider({
  initialLikes,
  children,
}: {
  initialLikes: number;
  children: React.ReactNode;
}) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <LikesContext.Provider value={{ likes, setLikes }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useSetLikes() {
  return useContext(LikesContext).setLikes;
}

export default function LiveWishCount({ wishes }: { wishes: number }) {
  const { likes } = useContext(LikesContext);

  return <WishStats count={wishes + likes} />;
}
