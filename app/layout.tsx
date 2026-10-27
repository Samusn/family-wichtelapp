import type { Metadata, Viewport } from "next";
import { Mountains_of_Christmas, Nunito } from "next/font/google";
import Background from "@components/Background";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const mountains = Mountains_of_Christmas({
  variable: "--font-mountains",
  subsets: ["latin"],
  weight: ["400", "700"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Wichtel4family",
  description: "Familien Wichtel App",
  icons: {
    icon: "/favicon.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#140a07",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${nunito.variable} ${mountains.variable} font-sans antialiased min-h-dvh`}
      >
        <Background />
        {children}
      </body>
    </html>
  );
}
