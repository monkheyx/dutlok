import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { AdminProvider } from "@/components/admin-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DUTLOK - Guild Dashboard",
  description: "World of Warcraft guild roster and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AdminProvider>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">{children}</main>
            <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
              DUTLOK Guild Dashboard
            </footer>
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
