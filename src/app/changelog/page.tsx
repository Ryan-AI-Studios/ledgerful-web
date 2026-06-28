import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { changelogEntries } from "@/lib/content/changelog";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Changelog",
  description: pageDescriptions.changelog,
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Milestones</p>
        <h1>Public, local, dashboard, and hosted work are tracked separately.</h1>
        <p>
          This changelog prevents public web milestones from being confused with
          local engine releases or future hosted control-plane capabilities.
        </p>
      </section>
      <section className="content-band">
        <SectionHeading title="Current entries" />
        <div className="timeline">
          {changelogEntries.map((entry) => (
            <article key={`${entry.area}-${entry.title}`}>
              <CalendarClock size={22} aria-hidden="true" />
              <div>
                <div className="timeline-meta">
                  <span>{entry.date}</span>
                  <span>{entry.area}</span>
                  <StatusPill status={entry.state} />
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.details}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
