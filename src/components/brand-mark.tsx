import Link from "next/link";

/**
 * Header/footer wordmark. Both theme variants are in the DOM; CSS shows only
 * the active one via [data-theme] (next-themes image pattern).
 *
 * Why not React state / MutationObserver:
 * - Pure CSS works before hydration and when client JS is delayed
 * - Avoids dual next/image wrappers that ignored display:none
 * - Avoids defaulting to the dark asset when the FOUC script already set light
 */
export function BrandMark({
  className = "",
  footer = false,
}: {
  className?: string;
  footer?: boolean;
}) {
  return (
    <Link
      href="/"
      className={footer ? `footer-brand ${className}`.trim() : `brand-mark ${className}`.trim()}
      aria-label="Ledgerful home"
    >
      <span className={footer ? "brand-banner brand-banner--footer" : "brand-banner"}>
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img so display:none works */}
        <img
          src="/brand/banner-dark-960.webp"
          alt=""
          width={960}
          height={411}
          decoding="async"
          className="brand-banner-img brand-banner-img--dark"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img so display:none works */}
        <img
          src="/brand/banner-light-960.webp"
          alt=""
          width={960}
          height={411}
          decoding="async"
          className="brand-banner-img brand-banner-img--light"
        />
      </span>
    </Link>
  );
}
