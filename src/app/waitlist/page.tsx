import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { WaitlistForm } from "@/components/waitlist-form";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Launch updates — Ledgerful",
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
        <p className="hero-kicker">Launch updates</p>
        <h1>Get launch updates</h1>
        <p>
          Ledgerful is installed and public. Leave your email for launch
          announcements and changelog updates — nothing else.
        </p>
      </section>

      <section className="content-band">
        <WaitlistForm />
      </section>

      <section className="content-band">
        <SectionHeading title="What you are signing up for">
          An email when we ship a notable update or changelog entry. Nothing
          else. Your email is sent to Kit, our email provider, solely to deliver
          launch announcements and changelog updates. We do not sell it or use
          it for anything beyond that. Double opt-in means you confirm from your
          inbox before we add you.
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
