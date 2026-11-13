import { useState } from "react";
import { avatarUrl } from "../utils/avatarUrl";

// Light pastels, so dark initials read on all of them in both themes
const PALETTE = [
  ["oklch(0.83 0.1 175)", "oklch(0.76 0.09 200)"], // mint
  ["oklch(0.81 0.09 230)", "oklch(0.74 0.11 250)"], // sky
  ["oklch(0.79 0.1 295)", "oklch(0.72 0.12 310)"], // violet
  ["oklch(0.8 0.11 35)", "oklch(0.73 0.13 25)"], // coral
  ["oklch(0.86 0.12 85)", "oklch(0.8 0.14 68)"], // amber
  ["oklch(0.8 0.1 355)", "oklch(0.73 0.12 340)"], // rose
  ["oklch(0.86 0.13 130)", "oklch(0.79 0.14 145)"], // lime
  ["oklch(0.79 0.08 265)", "oklch(0.72 0.1 280)"], // periwinkle
];

// the same name always gets the same color, on every page
function paletteFor(name = "") {
  let hash = 0;
  for (const ch of name.toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const [from, to] = PALETTE[Math.abs(hash) % PALETTE.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// One avatar used everywhere: the photo at the right size, or the first letter of the name
// when there's no photo or it fails to load. Shape and border come from `className`.
export default function UserAvatar({ src, name, size = 32, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const box = { width: size, height: size };

  if (!src || failedSrc === src) {
    return (
      <div
        style={{ ...box, fontSize: Math.round(size * 0.4), backgroundImage: paletteFor(name), color: "oklch(0.24 0.03 250)" }}
        className={`shrink-0 flex items-center justify-center font-display font-semibold select-none ${className}`}
        aria-label={name}
      >
        {name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl(src, size)}
      alt={name}
      width={size}
      height={size}
      style={box}
      onError={() => setFailedSrc(src)}
      className={`shrink-0 object-cover bg-surface-hover ${className}`}
    />
  );
}
