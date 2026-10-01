import { FAMILY, INK } from "./characters";

/*
 * The Dot Family mark: one big dot with eyes and two little relatives.
 * Plain SVG strings, shared by the React logo and the asset script.
 */

const eyes = (cx: number, cy: number, gap: number, r: number) =>
  `<circle cx="${cx - gap}" cy="${cy}" r="${r}" fill="${INK}"/><circle cx="${cx + gap}" cy="${cy}" r="${r}" fill="${INK}"/>`;

/** Mark on a transparent background, 40 x 40 box. */
export function markSvg(opts: { outline?: boolean } = {}) {
  const ring = opts.outline ? ` stroke="${INK}" stroke-width="1.6"` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" aria-hidden="true">` +
    `<circle cx="16" cy="23" r="12.5" fill="${FAMILY.dot.color}"${ring}/>` +
    eyes(17.5, 22.5, 4.2, 1.9) +
    `<circle cx="31.5" cy="11" r="6" fill="${FAMILY.block.color}"${ring}/>` +
    `<circle cx="33" cy="29.5" r="4.4" fill="${FAMILY.bloom.color}"${ring}/>` +
    `</svg>`
  );
}

/** App icon: the mark on a deep green plate, readable on light and dark tab bars. */
export function iconSvg(size = 512) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="15" fill="#304d3d"/>` +
    `<circle cx="27" cy="36" r="19" fill="${FAMILY.dot.color}"/>` +
    eyes(29, 35, 6.5, 3) +
    `<circle cx="50" cy="16" r="8" fill="${FAMILY.block.color}"/>` +
    `<circle cx="52" cy="44" r="6" fill="${FAMILY.bloom.color}"/>` +
    `</svg>`
  );
}
