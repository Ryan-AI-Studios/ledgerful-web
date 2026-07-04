import type { Metadata } from "next";
import type { Organization, WithContext } from "schema-dts";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { homeOgImage, siteUrl } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";
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
      "Ledgerful — Local-First Code Change Risk Analysis for Developer Teams",
    template: "%s | Ledgerful",
  },
  description:
    "Ledgerful analyzes your Git repositories locally to surface change risk, provenance, and SOC 2-style evidence — without uploading your source code. Install the CLI and run it on your machine.",
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
    url: "/",
    siteName: "Ledgerful",
    images: [homeOgImage],
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
    images: [homeOgImage.url],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
  },
};

// sameAs must never link to a surface that isn't publicly reachable yet —
// the canonical GitHub repository is still a private preview (see
// launch-facts.ts), so it's only included here once anonymousAccess flips
// to true. No other real, publicly-reachable Ledgerful profile exists today.
const sameAs: string[] = launchTruth.facts.repository.anonymousAccess
  ? [launchTruth.facts.repository.href]
  : [];

// Target-query topics from recommendation.md §4.6, adapted to what's
// actually shipped today (see launch-facts.ts / pageDescriptions) — no
// crypto/accounting-adjacent wording.
const knowsAbout = [
  "Local-first code analysis",
  "Code change risk analysis",
  "Deterministic code review",
  "Software bill of materials and provenance",
  "SOC 2-style evidence export for engineering teams",
  "Multi-repository change impact",
];

const organizationJsonLd: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ledgerful",
  url: siteUrl,
  description:
    "Local-first change intelligence and signed provenance for programming teams.",
  founder: { "@type": "Organization", name: "Ryan AI Studios" },
  knowsAbout,
  ...(sameAs.length > 0 ? { sameAs } : {}),
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
