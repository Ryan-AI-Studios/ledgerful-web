import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { WaitlistForm } from "@/components/waitlist-form";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Early access — Ledgerful",
  description: pageDescriptions.waitlist,
  alternates: { canonical: "/waitlist" },
  openGraph: {
    url: "/waitlist",
    images: [homeOgImage],
  },
  twitter: {
    images: [homeOgImage],
  },
};

export default function WaitlistPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Quiet preview</p>
        <h1>Register interest in Ledgerful.</h1>
        <p>
          We are in quiet preview. Leave your email and we will let you know when
          Ledgerful is ready to install. No commitment, no timeline, no purchase.
        </p>
      </section>

      <section className="content-band">
        <WaitlistForm />
      </section>

      <section className="content-band">
        <SectionHeading title="What you are signing up for">
          An email when Ledgerful is ready to install. Nothing else. Your email
          is sent to Kit, our email provider, solely to deliver the launch
          announcement. We do not sell it or use it for anything beyond that.
          Double opt-in means you confirm your interest from your inbox before
          we add you.
        </SectionHeading>
      </section>

      <section className="content-band">
        <p>
          How we handle your email is documented on the{" "}
          <Link href="/trust" className="inline-link">
            trust page
          </Link>
          .
        </p>
      </section>
    </PageShell>
  );
}
