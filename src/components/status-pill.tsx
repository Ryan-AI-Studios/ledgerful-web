import { stateLabels, type FeatureState } from "@/lib/content/features";
import type { LaunchFactStatus } from "@/lib/content/launch-facts";

type Status = FeatureState | LaunchFactStatus | "completed" | "in progress";

const labels: Record<Status, string> = {
  ...stateLabels,
  resolved: "Resolved",
  unresolved: "Unresolved",
  planned: "Planned",
  completed: "Completed",
  "in progress": "In progress",
};

export function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill status-${slug(status)}`}>{labels[status]}</span>;
}

function slug(status: Status) {
  return status.replace(/\s+/g, "-");
}
