export function LogoMerke({ className = "w-[26px] h-[26px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className}>
      <path
        d="M256 96 C269.6 189 279 198.4 372 212 C279 225.6 269.6 235 256 328 C242.4 235 233 225.6 140 212 C233 198.4 242.4 189 256 96 Z"
        fill="#2F4A52"
      />
      <path
        d="M256 352 C261.4 389.2 265.2 393 302.4 398.4 C265.2 403.8 261.4 407.6 256 444.8 C250.6 407.6 246.8 403.8 209.6 398.4 C246.8 393 250.6 389.2 256 352 Z"
        fill="#7E8E80"
      />
    </svg>
  );
}
