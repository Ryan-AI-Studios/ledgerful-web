import Link from "next/link";
import { mainNavigation } from "@/lib/content/navigation";
import { launchFacts } from "@/lib/content/launch-facts";
import { StatusPill } from "./status-pill";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="footer-brand">
          Ledgerful
        </Link>
        <p>
          Public web for a local-first change intelligence and provenance tool.
          No hosted-source-upload claim is made here.
        </p>
      </div>
      <div className="footer-grid">
        <div>
          <p style={{ fontWeight: 720, fontSize: "0.96rem", marginBottom: "12px" }}>Pages</p>
          <ul>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ fontWeight: 720, fontSize: "0.96rem", marginBottom: "12px" }}>Launch facts</p>
          <ul>
            {launchFacts.slice(0, 4).map((fact) => (
              <li key={fact.label}>
                <span>{fact.label}</span>
                <StatusPill status={fact.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
