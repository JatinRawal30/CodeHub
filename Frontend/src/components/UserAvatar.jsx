import { useState } from "react";
import { avatarUrl } from "../utils/avatarUrl";

// One avatar used everywhere: the photo at the right size, or the first letter of the name
// when there's no photo or it fails to load. Shape and border come from `className`.
export default function UserAvatar({ src, name, size = 32, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const box = { width: size, height: size };

  if (!src || failedSrc === src) {
    return (
      <div
        style={{ ...box, fontSize: Math.round(size * 0.4) }}
        className={`shrink-0 flex items-center justify-center bg-[#151619] font-bold text-[#e2a24a] select-none ${className}`}
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
      className={`shrink-0 object-cover ${className}`}
    />
  );
}
