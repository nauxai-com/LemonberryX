'use client';
import "./globals.css";
import GradientBlobs from "@/components/layout/GradientBlobs";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <title>LemonberryX</title>
        <meta name="description" content="YouTube Channel Operations Dashboard" />
      </head>
      <body style={{ height: '100%', margin: 0, background: '#0f0c29', overflow: 'hidden' }}>
        {/* Fixed background layer */}
        <GradientBlobs />

        {/* App layout */}
        <div className="app">
          <Sidebar />
          <main className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
