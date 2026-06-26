import type { Metadata } from "next";
import { Database, KeyRound, RadioTower, Shield } from "lucide-react";
import { LaunchFacts } from "@/components/launch-facts";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { pageDescriptions } from "@/lib/content/navigation";

export const metadata: Metadata = {
  title: "Trust",
  description: pageDescriptions.trust,
  alternates: {
    canonical: "/trust",
  },
};

const flows = [
  {
    icon: Shield,
    title: "Local default",
    text: "Ledgerful reads git/project state locally and writes local evidence. Source upload is not required by default.",
  },
  {
    icon: KeyRound,
    title: "Daemon access",
    text: "The local dashboard is loopback daemon-backed and uses ephemeral ?token= access. Tokens do not belong in logs or examples.",
  },
  {
    icon: RadioTower,
    title: "Telemetry",
    text: "Usage telemetry is opt-in and backend-controlled. Public docs should not imply source upload by telemetry.",
  },
  {
    icon: Database,
    title: "Hosted future",
    text: "Accounts, GitHub App webhooks, billing, RBAC, SCIM, SSO, and hosted audit logs require a future control plane.",
  },
];

export default function TrustPage() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Security posture</p>
        <h1>Trust starts with the local-first boundary.</h1>
        <p>
          This page states what Ledgerful reads, writes, uploads by default, and
          what remains planned until hosted infrastructure exists.
        </p>
      </section>
      <section className="content-band">
        <SectionHeading title="Data flow">
          The public story should help a security reviewer approve a local pilot
          without private clarification.
        </SectionHeading>
        <div className="trust-grid">
          {flows.map((flow) => {
            const Icon = flow.icon;
            return (
              <article key={flow.title}>
                <Icon size={24} aria-hidden="true" />
                <h2>{flow.title}</h2>
                <p>{flow.text}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="split-band">
        <SectionHeading title="Evidence and disclosure">
          Local SOC2 export is a ZIP generated from local evidence. Subprocessors
          are none for local mode and to be defined for hosted mode. Responsible
          disclosure details remain a launch fact until the public channel exists.
        </SectionHeading>
        <LaunchFacts />
      </section>
    </PageShell>
  );
}
