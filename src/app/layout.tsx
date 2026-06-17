import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { CursorGlow } from "@/components/CursorGlow";
import { LoaderOrchestrator } from "@/components/LoaderOrchestrator";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { ThemeProvider } from "@/context/ThemeContext";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Yugantar — Where Ideas Become Movements",
    template: "%s | Yugantar",
  },
  description:
    "Discover visionaries, innovators, leaders, and creators shaping tomorrow. Where ideas become movements.",
  keywords: [
    "Yugantar",
    "ideas",
    "innovation",
    "community",
    "visionaries",
    "creators",
    "movements",
  ],
  openGraph: {
    title: "Yugantar — Where Ideas Become Movements",
    description:
      "Discover visionaries, innovators, leaders, and creators shaping tomorrow.",
    url: "https://yugantar-sigma.vercel.app",
    siteName: "Yugantar",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yugantar — Where Ideas Become Movements",
    description:
      "Discover visionaries, innovators, leaders, and creators shaping tomorrow.",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col noise-overlay">
        <ThemeProvider>
          <AuthProvider>
            <LoaderOrchestrator>
              <CursorGlow />
              <Navbar />
              <main className="flex-1 flex flex-col">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </LoaderOrchestrator>
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
