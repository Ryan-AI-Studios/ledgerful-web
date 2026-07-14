import type { LaunchFactStatus } from "@/lib/content/launch-facts";

type LegacyStatus = LaunchFactStatus | "completed" | "in progress";

const labels: Record<LegacyStatus, string> = {
  resolved: "Resolved",
  unresolved: "Unresolved",
  planned: "Planned",
  completed: "Completed",
  "in progress": "In progress",
};

export function LaunchPill({ status }: { status: LegacyStatus }) {
  return <span className={`status-pill status-${status.replace(/\s+/g, "-")}`}>{labels[status]}</span>;
}