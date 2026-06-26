import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { docTopics } from "@/lib/content/docs";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Docs",
  description: pageDescriptions.docs,
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Docs baseline</p>
        <h1>Install and operate Ledgerful with launch facts in view.</h1>
        <p>
          These starter docs separate the local product surface from future hosted
          capabilities and mark unresolved release links before launch.
        </p>
      </section>
      <section className="content-band">
        <SectionHeading title="Starter documentation map">
          Each topic has a state and a next action. Unresolved release/package
          links are deliberately not rendered as live destinations.
        </SectionHeading>
        <div className="doc-grid">
          {docTopics.map((topic) => (
            <article key={topic.title}>
              <BookOpen size={22} aria-hidden="true" />
              <div>
                <h2>{topic.title}</h2>
                <StatusPill status={topic.state === "unresolved" ? "unresolved" : topic.state} />
              </div>
              <p>{topic.summary}</p>
              <p className="next-action">
                <ExternalLink size={16} aria-hidden="true" />
                {topic.nextAction}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
