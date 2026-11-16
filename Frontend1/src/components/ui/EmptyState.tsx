import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'catalog' | 'cart' | 'order';
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'catalog',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-12 text-center shadow-xs">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#F8FAFC] ring-1 ring-[#E2E8F0]">
        <svg
          width="58"
          height="58"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="28" fill="#0A192F" fillOpacity="0.06" />
          {variant === 'cart' ? (
            <>
              <path
                d="M16 20H22L26 42H46L50 26H24"
                stroke="#0A192F"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="28" cy="48" r="3" fill="#D4AF37" />
              <circle cx="44" cy="48" r="3" fill="#D4AF37" />
            </>
          ) : variant === 'order' ? (
            <>
              <rect
                x="18"
                y="14"
                width="28"
                height="36"
                rx="4"
                stroke="#0A192F"
                strokeWidth="2.8"
              />
              <path
                d="M25 25H39M25 32H35M25 39H31"
                stroke="#D4AF37"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <circle
                cx="29"
                cy="29"
                r="12"
                stroke="#0A192F"
                strokeWidth="2.8"
              />
              <path
                d="M38 38L47 47"
                stroke="#D4AF37"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </div>
      <h3 className="font-heading text-lg font-bold text-[#0F172A]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[#475569]">{description}</p>
      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#0A192F] transition-colors duration-200 hover:bg-[#E5C158] active:bg-[#B5952F]"
        >
          <Icon icon="solar:refresh-bold" className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

