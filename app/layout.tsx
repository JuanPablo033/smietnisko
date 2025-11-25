import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'leaflet/dist/leaflet.css'; // Styl mapy - musi zostać!

// Konfiguracja czcionki Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoMap - Zgłoś Odpady",
  description: "Platforma do zgłaszania dzikich wysypisk i dbania o środowisko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}