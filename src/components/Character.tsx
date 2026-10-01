import { characterSvg, FAMILY, type Kind, type Mood } from "@/lib/characters";

/** One family member. Pure SVG markup, so it renders on the server too. */
export function Character({
  kind,
  mood = "normal",
  className = "",
  label,
  shadow = true,
  style,
}: {
  kind: Kind;
  mood?: Mood;
  className?: string;
  /** Accessible name; omit for decorative art. */
  label?: string;
  shadow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`char ${className}`}
      style={style}
      data-kind={kind}
      dangerouslySetInnerHTML={{ __html: characterSvg(kind, { mood, shadow, title: label }) }}
    />
  );
}

export const memberName = (kind: Kind) => FAMILY[kind].name;
