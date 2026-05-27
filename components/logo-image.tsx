"use client";

export function LogoImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const fallbackId = `logo-fb-${alt}`;
  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`object-contain ${className}`}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const el = document.getElementById(fallbackId);
          if (el) el.style.display = "inline-grid";
        }}
      />
      <span
        id={fallbackId}
        className={`hidden place-items-center bg-paper-200 text-[10px] font-bold text-ink-600 ${className}`}
        aria-hidden="true"
      >
        {alt.charAt(0)}
      </span>
    </>
  );
}
