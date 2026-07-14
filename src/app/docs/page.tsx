import type { Metadata } from "next";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatusPill } from "@/components/status-pill";
import { docTopics } from "@/lib/content/docs";
import { launchTruth } from "@/lib/content/launch-facts";
import { homeOgImage, pageDescriptions } from "@/lib/content/navigation";
import { pillars } from "@/lib/content/pillars";

export const metadata: Metadata = {
  title: "Docs — CLI, dashboard, MCP, GitHub Action, compliance, sync",
  description: pageDescriptions.docs,
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    url: "/docs",
    images: [homeOgImage],
  },
  twitter: {
    images: [homeOgImage.url],
  },
};

export default function DocsPage() {
  const { release } = launchTruth.facts;
  const liveTopics = docTopics.filter((t) => t.maturity !== "planned");
  const pendingTopics = docTopics.filter((t) => t.maturity === "planned");

  const renderCard = (topic: (typeof docTopics)[number]) => {
    const inner = (
      <>
        <BookOpen size={22} aria-hidden="true" />
        <div className="doc-card-head">
          <h3>{topic.title}</h3>
          <StatusPill maturity={topic.maturity} deployment={topic.deployment} />
        </div>
        <p>{topic.summary}</p>
        {topic.href ? (
          <p className="next-action">
            <ArrowRight size={16} aria-hidden="true" />
            Open guide
          </p>
        ) : (
          <p className="next-action" style={{ color: "var(--muted)", fontWeight: 400 }}>
            {topic.nextAction}
          </p>
        )}
      </>
    );
    return topic.href ? (
      <Link
        key={topic.title}
        href={topic.href}
        className="doc-card-link"
        aria-label={`Open guide: ${topic.title}`}
      >
        <article>{inner}</article>
      </Link>
    ) : (
      <article key={topic.title} className="doc-card-static">{inner}</article>
    );
  };

  const topicsForPillar = (pillarId: string) =>
    liveTopics.filter((t) => t.pillar === pillarId);

  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Documentation</p>
        <h1>Install and operate Ledgerful.</h1>
        <p>
          These docs cover the local product surface and explicitly mark hosted
          or planned capabilities so you can tell what ships today.
        </p>
      </section>
      <section className="content-band">
        <SectionHeading title="Documentation index">
          Organized by what Ledgerful does. Hosted and planned capabilities are
          state-labeled so you can tell what ships today.
        </SectionHeading>
        {pillars.map((pillar) => {
          const pillarTopics = topicsForPillar(pillar.id);
          if (pillarTopics.length === 0) return null;
          return (
            <div key={pillar.id} className="doc-pillar-group">
              <h3 className="doc-pillar-heading">{pillar.label}</h3>
              <p className="doc-pillar-desc">{pillar.description}</p>
              <div className="doc-grid">{pillarTopics.map(renderCard)}</div>
            </div>
          );
        })}
        {pendingTopics.length > 0 && (
          <>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.9rem",
                marginTop: "32px",
                marginBottom: "16px",
              }}
            >
              {release.value}. The hosted GitHub App is a planned surface —
              its workflow YAML is documented as a reference shape, not an
              installable action.
            </p>
            <div className="doc-grid">{pendingTopics.map(renderCard)}</div>
          </>
        )}
      </section>
    </PageShell>
  );
}
