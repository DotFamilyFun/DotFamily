import { markSvg } from "@/lib/brandart";

export function Mark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 leading-none ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: markSvg().replace("<svg ", `<svg width="${size}" height="${size}" `) }}
    />
  );
}

/** Mark plus the "Dot Family" wordmark. */
export function Logo({ compactBelow = false }: { compactBelow?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mark size={28} />
      <span className={`font-display text-[19px] tracking-[-0.03em] text-ink ${compactBelow ? "max-[400px]:hidden" : ""}`}>
        Dot Family
      </span>
    </span>
  );
}
