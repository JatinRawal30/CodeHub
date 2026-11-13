import { Link } from "react-router-dom";

export default function CodeHubLogo({ showText = true, className = "", size = "md" }) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const svgSizes = {
    sm: "w-[18px] h-[18px]",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizes = {
    sm: "text-[1.35rem] sm:text-[1.6rem]",
    md: "text-[2rem]",
    lg: "text-[2.5rem]",
  };

  // with text, the "Hub" block is the mark, so the icon tile is only used on its own
  if (showText) {
    return (
      <Link
        to="/"
        aria-label="CodeHub home"
        className={`inline-flex items-center gap-1 font-logo font-bold leading-none tracking-tight group ${textSizes[size] || textSizes.md} ${className}`}
      >
        <span className="text-fg">Code</span>
        <span className="rounded-md bg-brand px-1.5 py-1 text-brand-fg transition-[filter] group-hover:brightness-95">Hub</span>
      </Link>
    );
  }

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`${iconSizes[size] || iconSizes.md} rounded-md flex items-center justify-center bg-primary text-primary-fg border border-primary-hover shadow-card transition-colors group-hover:bg-primary-hover`}
      >
        <svg
          className={svgSizes[size] || svgSizes.md}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 7L3 12L8 17" />
          <path d="M16 7L21 12L16 17" />
          <path className="opacity-60" d="M13.5 5L10.5 19" />
        </svg>
      </div>
    </Link>
  );
}
