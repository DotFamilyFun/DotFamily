import { BRAND } from "@/config/brand";

/* The owner's logo: the rounded D with its green dot (mark) and the
   ".Dotfamily" wordmark, both cut from the supplied artwork. */

const MARK_RATIO = 1.15; // width / height of public/brand/mark.webp
const WORDMARK_RATIO = 450 / 96; // width / height of public/brand/wordmark.webp

export function Mark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/brand/mark.webp"
      alt=""
      aria-hidden="true"
      width={Math.round(size * MARK_RATIO)}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      style={{ height: size, width: "auto" }}
    />
  );
}

/** Wordmark; with `compactBelow` it falls back to the mark on very narrow screens. */
export function Logo({ compactBelow = false, height = 24 }: { compactBelow?: boolean; height?: number }) {
  return (
    <span className="flex items-center" data-logo>
      <img
        src="/brand/wordmark.webp"
        alt={BRAND.name}
        width={Math.round(height * WORDMARK_RATIO)}
        height={height}
        className={`block ${compactBelow ? "max-[400px]:hidden" : ""}`}
        style={{ height, width: "auto" }}
      />
      {compactBelow ? (
        <span className="hidden max-[400px]:inline-flex">
          <Mark size={height + 4} />
        </span>
      ) : null}
    </span>
  );
}
