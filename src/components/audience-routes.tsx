import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Three real navigation paths, not invented personas or quotes. Each row
// states one honest sentence about what that reader will find and where.
const routes = [
  {
    role: "Developer",
    body: "Install the CLI and run a scan against a real repository on your own machine.",
    href: "/install",
    cta: "Go to install steps",
  },
  {
    role: "Engineering manager",
    body: "Compare available, beta, and planned editions before committing a team to one.",
    href: "/pricing",
    cta: "See editions",
  },
  {
    role: "Security or compliance reviewer",
    body: "Read the trust posture: what runs locally, what is opt-in, and what evidence exports contain.",
    href: "/trust",
    cta: "Read the trust page",
  },
] as const;

export function AudienceRoutes() {
  return (
    <div className="audience-routes" aria-label="Where to start by role">
      {routes.map((route) => (
        <article className="audience-row" key={route.role}>
          <div>
            <h3>{route.role}</h3>
            <p>{route.body}</p>
          </div>
          <Link className="next-action" href={route.href}>
            {route.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
