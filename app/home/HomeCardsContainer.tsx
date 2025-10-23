"use client";
import React from "react";
import HomeCard from "./HomeCard";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PeopleIcon from "@mui/icons-material/People";

export default function HomeCardsContainer() {
  return (
    <div className="w-full flex flex-col sm:flex-row gap-6 flex-wrap justify-center sm:justify-start">
      <HomeCard
        title="Wichtellosen ziehen"
        description="Ziehe dein Wichtel-Los für die Weihnachtsaktion."
        href="/draw"
        icon={<CardGiftcardIcon />}
        bgColor="bg-red-100"
      />
      <HomeCard
        title="Wunschlisten"
        description="Erstelle dir deine eigene Wunschlisten"
        href="/wishpage"
        icon={<ListAltIcon />}
        bgColor="bg-yellow-100"
      />
      <HomeCard
        title="Teilnehmerliste"
        description="Alle Teilnehmer im Überblick sehen."
        href="/participant"
        icon={<PeopleIcon />}
        bgColor="bg-green-100"
      />
    </div>
  );
}
