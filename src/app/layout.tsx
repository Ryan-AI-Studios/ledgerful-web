import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/content/navigation";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ledgerful | Local-first change intelligence",
    template: "%s | Ledgerful",
  },
  description:
    "Ledgerful is local-first change intelligence and signed provenance for programming teams evaluating repo risk and trust evidence.",
  applicationName: "Ledgerful",
  authors: [{ name: "Ryan AI Studios" }],
  openGraph: {
    title: "Ledgerful",
    description:
      "Local-first change intelligence, signed history, and verification evidence for programming teams.",
    url: siteUrl,
    siteName: "Ledgerful",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ledgerful",
    description:
      "Local-first change intelligence, signed history, and verification evidence for programming teams.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
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
      className={`${archivo.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
