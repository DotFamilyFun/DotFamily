/*
 * The Dot Family cast, drawn as plain SVG strings so the same art renders in
 * React, in route handlers and in the asset script that writes the .webp files.
 * Every shape sits in a 120 x 120 box with a soft offset shadow under it.
 */

export const KINDS = ["dot", "block", "spark", "ghost", "bean", "bloom"] as const;
export type Kind = (typeof KINDS)[number];
export type Mood = "normal" | "joy";

export const isKind = (v: unknown): v is Kind => typeof v === "string" && (KINDS as readonly string[]).includes(v);

export const INK = "#29372f";

type Member = {
  kind: Kind;
  name: string;
  color: string;
  /** Lighter tint for tiles and bubbles. */
  tint: string;
  trait: string;
  bio: string;
};

export const FAMILY: Record<Kind, Member> = {
  dot: {
    kind: "dot",
    name: "Pip",
    color: "#fdd86e",
    tint: "#fbefc6",
    trait: "first to arrive, last to leave",
    bio: "Pip was the first dot on the page. Pip still greets every newcomer as if they were the guest of honour.",
  },
  block: {
    kind: "block",
    name: "Cubby",
    color: "#ae9fec",
    tint: "#e8e2fb",
    trait: "grumpy, secretly sweet",
    bio: "Cubby has four corners and an opinion on each of them. Cubby also remembers everybody's birthday.",
  },
  spark: {
    kind: "spark",
    name: "Zing",
    color: "#ffa585",
    tint: "#ffe3d8",
    trait: "already three ideas ahead",
    bio: "Zing never finishes a sentence because the next idea arrived first. Most of the family lore started as a Zing tangent.",
  },
  ghost: {
    kind: "ghost",
    name: "Boo",
    color: "#bcdcf5",
    tint: "#e3f0fb",
    trait: "quiet, sees everything",
    bio: "Boo floats in, listens to the whole conversation and leaves one comment that settles it.",
  },
  bean: {
    kind: "bean",
    name: "Bean",
    color: "#8ed9c6",
    tint: "#d9f3ec",
    trait: "winks at the wrong moment",
    bio: "Bean is the family's comic relief and the reason nobody can keep a straight face at dinner.",
  },
  bloom: {
    kind: "bloom",
    name: "Bloom",
    color: "#f4afc8",
    tint: "#fbe1ea",
    trait: "always watching the charts",
    bio: "Bloom stares a little too hard at everything, especially candles. Bloom is usually right, and never lets anyone forget it.",
  },
};

const SHADOW = "rgba(41,55,47,0.13)";

function starPath(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function bloomPath() {
  // Eight round petals around a full centre, as one compound path.
  const parts: string[] = [];
  const circle = (x: number, y: number, r: number) =>
    `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    parts.push(circle(60 + 30 * Math.cos(a), 60 + 30 * Math.sin(a), 18));
  }
  parts.push(circle(60, 60, 33));
  return parts.join("");
}

const BODY: Record<Kind, { d: string; face: [number, number]; stroke?: number; rotate?: number }> = {
  dot: { d: "M60 14C86 13 104 31 104 58C104 86 86 104 58 104C31 104 14 87 15 59C16 32 33 15 60 14Z", face: [62, 58] },
  block: { d: "M36 17H84Q103 17 103 36V83Q103 102 84 102H36Q17 102 17 83V36Q17 17 36 17Z", face: [60, 56], rotate: -5 },
  spark: { d: starPath(60, 64, 48, 23), face: [60, 66], stroke: 12 },
  ghost: {
    d: "M60 15C84 15 99 33 99 57V99Q92 92 85 99Q78 106 72 99Q66 92 60 99Q54 106 48 99Q42 92 35 99Q28 106 21 99V57C21 33 36 15 60 15Z",
    face: [60, 54],
  },
  bean: {
    d: "M46 20C62 11 79 22 81 39C83 52 100 56 103 74C105 93 88 105 65 103C41 101 16 97 15 74C14 56 30 53 33 41C35 31 38 25 46 20Z",
    face: [58, 72],
  },
  bloom: { d: bloomPath(), face: [60, 60] },
};

function eye(kind: Kind, mood: Mood, x: number, y: number, side: -1 | 1) {
  const joy = `<path d="M${x - 7} ${y + 3}Q${x} ${y - 8} ${x + 7} ${y + 3}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  if (mood === "joy") return joy;
  switch (kind) {
    case "block": {
      // Heavy lids: a half disc under a slanted brow.
      const tilt = side === -1 ? 3 : -3;
      return (
        `<path d="M${x - 8} ${y - 1}H${x + 8}A8 8 0 0 1 ${x - 8} ${y - 1}Z" fill="${INK}"/>` +
        `<path d="M${x - 10} ${y - 6 - tilt}L${x + 10} ${y - 6 + tilt}" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`
      );
    }
    case "spark": {
      const s = 8;
      return `<path d="M${x} ${y - s}Q${x + 1.6} ${y - 1.6} ${x + s} ${y}Q${x + 1.6} ${y + 1.6} ${x} ${y + s}Q${x - 1.6} ${y + 1.6} ${x - s} ${y}Q${x - 1.6} ${y - 1.6} ${x} ${y - s}Z" fill="${INK}"/>`;
    }
    case "ghost":
      return `<ellipse cx="${x}" cy="${y}" rx="5" ry="8" fill="${INK}"/><circle cx="${x + 1.6}" cy="${y - 3.5}" r="1.8" fill="#fff"/>`;
    case "bean":
      return side === -1
        ? `<ellipse cx="${x}" cy="${y}" rx="4.2" ry="7.5" fill="${INK}"/>`
        : `<path d="M${x - 6} ${y + 2}Q${x} ${y - 6} ${x + 6} ${y + 2}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    case "bloom":
      return `<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="3.4" fill="${INK}"/>`;
    default:
      return `<circle cx="${x}" cy="${y}" r="6.8" fill="${INK}"/><circle cx="${x + 2.4}" cy="${y - 2.4}" r="2.2" fill="#fff"/>`;
  }
}

/**
 * One family member as an SVG string. `gaze` wraps the eyes in a group that
 * follows the pointer through the --gx / --gy custom properties.
 */
export function characterSvg(kind: Kind, opts: { mood?: Mood; shadow?: boolean; gaze?: boolean; title?: string } = {}) {
  const { mood = "normal", shadow = true, gaze = true, title } = opts;
  const member = FAMILY[kind];
  const body = BODY[kind];
  const [fx, fy] = body.face;
  const spread = kind === "bloom" ? 13 : 12.5;
  const stroke = body.stroke ? ` stroke="${member.color}" stroke-width="${body.stroke}" stroke-linejoin="round"` : "";
  const shadowStroke = body.stroke ? ` stroke="${SHADOW}" stroke-width="${body.stroke}" stroke-linejoin="round"` : "";
  const rot = body.rotate ? ` transform="rotate(${body.rotate} 60 60)"` : "";
  const eyes = eye(kind, mood, fx - spread, fy, -1) + eye(kind, mood, fx + spread, fy, 1);
  const label = title ? `<title>${title}</title>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" ${title ? 'role="img"' : 'aria-hidden="true"'}>${label}` +
    `<g${rot}>` +
    (shadow ? `<path d="${body.d}" fill="${SHADOW}"${shadowStroke} transform="translate(4 6)"/>` : "") +
    `<path d="${body.d}" fill="${member.color}"${stroke}/>` +
    `<g${gaze ? ' class="dot-eyes"' : ""}>${eyes}</g>` +
    `</g></svg>`
  );
}
