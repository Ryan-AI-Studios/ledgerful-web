import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
  /** Extra classes (e.g. section-heading--full for full shell width). */
  className?: string;
}) {
  const classes = ["section-heading", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      {kicker ? <p className="section-kicker">{kicker}</p> : null}
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
