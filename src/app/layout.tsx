import type { Metadata } from "next";
import type { Organization, WithContext } from "schema-dts";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { homeOgImage, siteUrl } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";
import { indexingAllowed } from "@/lib/indexing-policy.mjs";
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
    default: "Ledgerful — Local-First Code Change Risk Analysis",
    template: "%s | Ledgerful",
  },
  description:
    "Ledgerful analyzes your Git repositories locally to surface change risk, provenance, and SOC 2-style evidence — without uploading your source code. Install the CLI and run it on your machine.",
  applicationName: "Ledgerful",
  authors: [{ name: "Ryan AI Studios" }],
  robots: indexingAllowed
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      }
    : {
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
    icon: [
      {
        url: "/brand/favicon-32-dark.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/brand/favicon-32-light.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      // Fallback when media is unsupported
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/icon-dark-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
// prohibited positioning or accounting-adjacent wording.
const knowsAbout = [
  "Local-first code analysis",
  "Code change risk analysis",
  "Deterministic code review",
  "Signed provenance for code changes",
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

const themeScript = `(function(){var r=document.documentElement;try{var p=localStorage.getItem("ledgerful-theme")||"system";if(!/^(system|dark|light)$/.test(p))p="system";var t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t}catch(e){r.dataset.theme="dark";r.dataset.themePreference="system";r.style.colorScheme="dark"}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-theme / data-theme-preference are owned by themeScript + ThemeToggle
    // (see src/lib/theme.ts). Do NOT hardcode them as React props — React would
    // re-apply the server values on layout re-render and cancel client changes.
    // suppressHydrationWarning: the blocking script may set attributes before
    // hydrate (standard App Router theme pattern; same as next-themes).
    <html
      lang="en"
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
