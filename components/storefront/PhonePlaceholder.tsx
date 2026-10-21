/** Phone outline shown where a product has no photo yet (as in the design mockups). */
export function PhonePlaceholder({ className = "w-[34%]" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`aspect-[1/2] rounded-[14px] border-[3px] border-line-strong bg-white ${className}`}
    />
  );
}
