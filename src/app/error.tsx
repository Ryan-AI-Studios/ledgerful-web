"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-boundary">
      <p className="hero-kicker">Unexpected error</p>
      <h1>Ledgerful could not render this page.</h1>
      <p>
        The public site should fail with a branded, conservative fallback rather
        than a framework default screen.
      </p>
      <div className="hero-actions">
        <button className="button-primary" onClick={reset} type="button">
          Try again
        </button>
        <Link className="button-secondary" href="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
