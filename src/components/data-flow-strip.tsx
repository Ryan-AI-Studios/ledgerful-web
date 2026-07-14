import Link from "next/link";

/**
 * One-line, quiet restatement of the default data flow. Sits between the
 * action -> receipt proof visual and the four-item proof strip. Not a
 * narrative chapter, so it does not carry a large SectionHeading — see the
 * visually-hidden <h2> in page.tsx for the landmark structure a11y needs.
 */
export function DataFlowStrip() {
  return (
    <p className="data-flow-strip">
      Reads your repo <span aria-hidden="true">→</span> analyzes on your
      machine <span aria-hidden="true">→</span> writes reports to disk.{" "}
      <Link href="/trust" className="inline-link">
        See the trust page
      </Link>
      .
    </p>
  );
}
