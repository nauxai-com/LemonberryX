import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import TabBar from "@/components/layout/TabBar";

export const metadata = {
  title: 'LemonberryX',
  description: 'YouTube Channel Operations Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#07050F', minHeight: '100vh' }}>
        <div className="app">
          <AppHeader />
          <TabBar />
          <main className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
