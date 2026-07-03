import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { siteUrl } from "@/lib/content/navigation";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "optional",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Ledgerful — local-first change intelligence for repo risk and signed provenance",
    template: "%s | Ledgerful",
  },
  description:
    "Ledgerful is local-first change intelligence and signed provenance for programming teams evaluating repo risk and trust evidence.",
  applicationName: "Ledgerful",
  authors: [{ name: "Ryan AI Studios" }],
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ledgerful",
  url: siteUrl,
  description:
    "Local-first change intelligence and signed provenance for programming teams.",
  founder: { "@type": "Organization", name: "Ryan AI Studios" },
};

const themeScript = `(function(){var r=document.documentElement;try{var p=localStorage.getItem("ledgerful-theme")||"dark";if(!/^(system|dark|light)$/.test(p))p="dark";var t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t}catch(e){r.dataset.theme="dark";r.dataset.themePreference="dark";r.style.colorScheme="dark"}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-theme-preference="dark"
      suppressHydrationWarning
      className={`${archivo.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
