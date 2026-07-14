import Link from "next/link";
import { footerNavigation, mainNavigation } from "@/lib/content/navigation";
import { launchTruth } from "@/lib/content/launch-facts";

const licensePath = "/trust#license";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">
          Ledgerful
        </Link>
        <span className="license-badge">
          <Link href={licensePath}>PolyForm NC</Link>
        </span>
        <p>
          Public web for a local-first change intelligence and provenance tool.
          The Ledgerful engine is source-available under{" "}
          <Link href={licensePath} className="inline-link">
            PolyForm Noncommercial
          </Link>
          . Built by{" "}
          <a
            href={launchTruth.facts.repository.href}
            className="inline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ryan AI Studios
          </a>
          .
        </p>
      </div>
      <div className="footer-grid">
        <div>
          <h2 className="footer-heading">Pages</h2>
          <ul>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {footerNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="footer-heading">Resources</h2>
          <ul>
            <li>
              <a
                href={launchTruth.facts.repository.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub repo
              </a>
            </li>
            <li>
              <Link href={licensePath}>License</Link>
            </li>
            <li>
              <a href="mailto:security@ledgerful.dev">Security disclosure</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
