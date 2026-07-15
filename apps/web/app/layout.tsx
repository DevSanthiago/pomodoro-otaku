import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SessionBoot } from "@/components/auth/session-boot";
import { ConquistaToast } from "@/components/gamification/conquista-toast";
import { TopBar } from "@/components/layout/top-bar";
import { PillarBackground } from "@/components/backgrounds/pillar-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodoro Otaku",
  description:
    "Pomodoro com temática anime e gamificação — foco, streak e evolução de personagem.",
  applicationName: "Pomodoro Otaku",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pomodoro Otaku",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <SessionBoot />
        <PillarBackground />
        <div className="relative z-10 flex flex-1 flex-col">
          <TopBar />
          {children}
        </div>
        <ConquistaToast />
      </body>
    </html>
  );
}
