import { Link } from "react-router-dom";

export default function CodeHubLogo({ showText = true, className = "", size = "md" }) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const svgSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* CodeHub Emblem */}
      <div
        className={`${iconSizes[size] || iconSizes.md} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
        style={{
          background: "linear-gradient(145deg, #202226, #151619)",
          border: "1px solid #2c2e33",
        }}
      >
        <svg
          className={svgSizes[size] || svgSizes.md}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Rounded Bracket Box */}
          <path
            d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z"
            stroke="#e2a24a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Left Bracket < (White) */}
          <path
            d="M9 10L7 12L9 14"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Bracket > (LeetCode Orange #e2a24a) */}
          <path
            d="M15 10L17 12L15 14"
            stroke="#e2a24a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <span className={`${textSizes[size] || textSizes.md} font-bold tracking-tight text-white`}>
          Code<span style={{ color: "#e2a24a" }}>Hub</span>
        </span>
      )}
    </Link>
  );
}
