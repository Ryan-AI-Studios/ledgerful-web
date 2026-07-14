import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="page-hero compact">
        <p className="hero-kicker">Route not found</p>
        <h1>This public page is not available.</h1>
        <p>
          Ledgerful claims are kept explicit. If a package, release,
          status, or hosted feature link is missing, it has not been published
          as a real destination yet.
        </p>
        <Link className="button-primary" href="/docs">
          Back to docs
        </Link>
      </section>
    </PageShell>
  );
}
