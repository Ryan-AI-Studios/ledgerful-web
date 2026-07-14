import { launchFacts } from "@/lib/content/launch-facts";
import { LaunchPill } from "./launch-pill";

export function LaunchFacts() {
  return (
    <div className="fact-list">
      {launchFacts.map((fact) => (
        <article className="fact-row" key={fact.label}>
          <div>
            <h3>{fact.label}</h3>
            <p>{fact.note}</p>
          </div>
          <div className="fact-meta">
            <LaunchPill status={fact.status} />
            {fact.href ? (
              <a
                href={fact.href}
                rel="noreferrer"
                target="_blank"
                aria-label={fact.label}
              >
                {fact.value}
              </a>
            ) : (
              <span>{fact.value}</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
