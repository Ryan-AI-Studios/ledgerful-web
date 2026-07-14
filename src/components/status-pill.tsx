import {
  deploymentLabels,
  maturityLabels,
  type Deployment,
  type Maturity,
} from "@/lib/content/features";

type StatusPillProps = {
  maturity: Maturity;
  deployment?: Deployment;
};

function slug(input: string) {
  return input.replace(/\s+/g, "-");
}

export function StatusPill({ maturity, deployment }: StatusPillProps) {
  const maturityClass = `status-${slug(maturity)}`;
  const deploymentClass = deployment ? `status-${slug(deployment)}` : undefined;
  const labelParts = [maturityLabels[maturity]];
  if (deployment) {
    labelParts.push(deploymentLabels[deployment]);
  }
  return (
    <span
      className={[
        "status-pill",
        maturityClass,
        deploymentClass,
      ].filter(Boolean).join(" ")}
      title={labelParts.join(" · ")}
    >
      {labelParts.join(" · ")}
    </span>
  );
}