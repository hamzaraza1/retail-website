// Stroke icons from the design files. Decorative by default (aria-hidden).

type IconProps = { size?: number; className?: string };

function Stroke({ size = 18, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const WhatsAppIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4L3 21z" /></Stroke>
);
export const SearchIcon = (p: IconProps) => (
  <Stroke {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Stroke>
);
export const PinIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Stroke>
);
export const ClockIcon = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>
);
export const PhoneIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></Stroke>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Stroke>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M15 18l-6-6 6-6" /></Stroke>
);
export const CheckIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M5 12l5 5 9-10" /></Stroke>
);
export const ShieldIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></Stroke>
);
export const CardIcon = (p: IconProps) => (
  <Stroke {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></Stroke>
);
export const TruckIcon = (p: IconProps) => (
  <Stroke {...p}><rect x="2" y="6" width="13" height="10" rx="1" /><path d="M15 9h4l3 3v4h-7" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></Stroke>
);
export const ExchangeIcon = (p: IconProps) => (
  <Stroke {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Stroke>
);

export function PlayIcon({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function StarIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
