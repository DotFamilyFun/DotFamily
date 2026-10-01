type P = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ArrowRight = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRight = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);
export const CopyIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 8h12v12H8z" />
    <path d="M16 8V4H4v12h4" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 8h18M3 16h18" />
  </svg>
);
export const ChevronDownIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const AlertIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3 2 21h20L12 3z" />
    <path d="M12 10v5M12 18v.5" />
  </svg>
);
export const LogOutIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h11" />
  </svg>
);
export const WalletIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 6h16v14H3z" />
    <path d="M3 6 15 3v3M15 13h2" />
  </svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
  </svg>
);
export const PlayIcon = ({ className }: P) => (
  <svg width="10" height="10" viewBox="0 0 10 10" className={className} aria-hidden="true">
    <path d="M1 0v10l8-5z" fill="currentColor" />
  </svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);
export const UploadIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" />
  </svg>
);
export const XIcon = ({ className }: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.2h1.7L7.4 4.72H5.58L16.67 19.2z" />
  </svg>
);
export const GithubIcon = ({ className }: P) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);
export const ArrowLeft = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const ArrowDown = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 4v15M6 13l6 6 6-6" />
  </svg>
);
export const PlusIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const RefreshIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3 12a9 9 0 0 1 15.7-6L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.7 6L3 16M8 16H3v5" />
  </svg>
);
export const CodeIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
  </svg>
);
export const SendIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 12 20 4l-6 16-3-7-7-1Z" />
  </svg>
);
