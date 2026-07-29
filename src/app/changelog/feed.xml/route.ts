import { changelogEntries } from "@/lib/content/changelog";
import { siteUrl } from "@/lib/content/navigation";

export const dynamic = "force-static";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const FEED_SELF = `${siteUrl}/changelog/feed.xml`;
const FEED_HTML = `${siteUrl}/changelog`;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc3339Date(date: string): string | null {
  if (!DATE_RE.test(date)) return null;
  return `${date}T00:00:00Z`;
}

function feedUpdated(): string {
  const real = changelogEntries
    .map((e) => e.date)
    .filter((d) => DATE_RE.test(d))
    .sort()
    .reverse();
  if (real.length === 0) {
    throw new Error("changelog feed requires at least one YYYY-MM-DD entry date");
  }
  return `${real[0]}T00:00:00Z`;
}

function orderedEntries() {
  const dated = changelogEntries
    .filter((e) => DATE_RE.test(e.date))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const planned = changelogEntries.filter((e) => !DATE_RE.test(e.date));
  return [...dated, ...planned];
}

export function GET() {
  const updated = feedUpdated();
  const entriesXml = orderedEntries()
    .map((entry) => {
      const permalink = `${FEED_HTML}#${entry.slug}`;
      const entryUpdated = toRfc3339Date(entry.date) ?? updated;
      const summary = `${entry.area}: ${entry.details}`;
      return [
        "  <entry>",
        `    <id>${escapeXml(permalink)}</id>`,
        `    <title>${escapeXml(entry.title)}</title>`,
        `    <updated>${entryUpdated}</updated>`,
        `    <link rel="alternate" href="${escapeXml(permalink)}"/>`,
        `    <summary>${escapeXml(summary)}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  const body = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
    `  <id>${escapeXml(FEED_SELF)}</id>`,
    `  <title>${escapeXml("Ledgerful changelog")}</title>`,
    `  <updated>${updated}</updated>`,
    `  <link rel="self" href="${escapeXml(FEED_SELF)}" type="application/atom+xml"/>`,
    `  <link rel="alternate" href="${escapeXml(FEED_HTML)}" type="text/html"/>`,
    `  <author><name>${escapeXml("Ledgerful")}</name></author>`,
    entriesXml,
    `</feed>`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
