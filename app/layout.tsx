'use client';
import type { Metadata } from "next";
import "./globals.css";
import GradientBlobs from "@/components/layout/GradientBlobs";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>LemonberryX</title>
        <meta name="description" content="YouTube Channel Operations Dashboard" />
      </head>
      <body className="h-full flex" style={{ background: '#150d2e' }}>
        <GradientBlobs />
        <div
          className="sphere-3d"
          style={{ top: '10%', right: '-100px' }}
        />
        <Sidebar />
        <main className="flex-1 overflow-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
