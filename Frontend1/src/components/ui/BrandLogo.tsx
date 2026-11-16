interface BrandLogoProps {
  compact?: boolean;
  showDomain?: boolean;
}

export function BrandLogo({ compact = false, showDomain = true }: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/50 bg-[#112240] shadow-sm">
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="5"
            width="26"
            height="22"
            rx="5"
            stroke="#D4AF37"
            strokeWidth="2.2"
          />
          <circle cx="8" cy="10" r="1.4" fill="#D4AF37" />
          <circle cx="8" cy="22" r="1.4" fill="#D4AF37" />
          <circle cx="24" cy="10" r="1.4" fill="#D4AF37" />
          <circle cx="24" cy="22" r="1.4" fill="#D4AF37" />
          <path d="M13.5 11.5L21 16L13.5 20.5V11.5Z" fill="#D4AF37" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-white">
          CINE <span className="text-[#D4AF37]">SMALL</span>
        </span>
        {showDomain && !compact && (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
            cinesmall.com
          </span>
        )}
      </div>
    </div>
  );
}

