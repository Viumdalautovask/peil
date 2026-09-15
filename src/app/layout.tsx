import type { Metadata, Viewport } from "next";
import { Outfit, Public_Sans } from "next/font/google";
import { FremdriftProvider } from "@/lib/fremdrift/store";
import { BunnNav } from "@/components/BunnNav";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Peil",
  description: "Leksehjelp som ikke gir deg svaret — for 8.–10. trinn.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nb" className={`${outfit.variable} ${publicSans.variable}`}>
      <body className="min-h-screen antialiased">
        <FremdriftProvider>
          {children}
          <BunnNav />
        </FremdriftProvider>
      </body>
    </html>
  );
}
