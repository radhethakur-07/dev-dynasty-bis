import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BIS Intelligence Assistant — Dev Dynasty SIH267107",
  description:
    "AI-powered conversational intelligence for Bureau of Indian Standards. Discover Indian Standards, certification schemes, hallmarking regulations, and accredited testing laboratories.",
  keywords: ["BIS", "Indian Standards", "ISI Mark", "HUID", "Hallmarking", "Certification", "Testing Laboratories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased`}
        style={{ backgroundColor: "var(--surface-base)", color: "var(--text-primary)" }}
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
