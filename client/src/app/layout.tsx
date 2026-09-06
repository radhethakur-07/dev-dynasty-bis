import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dev Dynasty — BIS Intelligence Assistant (SIH267107)",
  description: "AI-powered conversational intelligence assistant for Bureau of Indian Standards (BIS), Indian Standards discovery, certification guidance, hallmarking, and testing laboratories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
