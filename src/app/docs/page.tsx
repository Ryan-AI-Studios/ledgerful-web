import type { Metadata } from "next";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
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
  const liveTopics = docTopics.filter((t) => t.state !== "unresolved");
  const pendingTopics = docTopics.filter((t) => t.state === "unresolved");

  const renderCard = (topic: (typeof docTopics)[number]) => {
    const inner = (
      <>
        <BookOpen size={22} aria-hidden="true" />
        <div className="doc-card-head">
          <h3>{topic.title}</h3>
          <StatusPill status={topic.state} />
        </div>
        <p>{topic.summary}</p>
        {topic.href ? (
          <p className="next-action">
            <ArrowRight size={16} aria-hidden="true" />
            Read docs
          </p>
        ) : (
          <p className="next-action" style={{ color: "var(--muted)", fontWeight: 400 }}>
            {topic.nextAction}
          </p>
        )}
      </>
    );
    return topic.href ? (
      <article key={topic.title} style={{ position: "relative" }}>
        <Link
          href={topic.href}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--radius)",
            zIndex: 0,
          }}
          aria-label={`Read docs: ${topic.title}`}
        />
        <div style={{ pointerEvents: "none" }}>{inner}</div>
      </article>
    ) : (
      <article key={topic.title}>{inner}</article>
    );
  };

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
          Seven topics cover every product surface. Unresolved release and
          package links are disclosed rather than presented as live destinations.
        </SectionHeading>
        <div className="doc-grid">{liveTopics.map(renderCard)}</div>
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
              More documentation topics are being finalized as release artifacts
              become available.
            </p>
            <div className="doc-grid">{pendingTopics.map(renderCard)}</div>
          </>
        )}
      </section>
    </PageShell>
  );
}
