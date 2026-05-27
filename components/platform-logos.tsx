"use client";

const logoMap: Record<string, string> = {
  xiaohongshu: "/logos/小红书.png",
  douyin: "/logos/抖音.png",
  bilibili: "/logos/Bilibili-icon.png",
  zhihu: "/logos/知乎.png",
  x: "/logos/X.jpeg",
};

export function PlatformLogo({ platform, className = "" }: { platform: string; className?: string }) {
  const src = logoMap[platform];
  if (!src) return <div className={`rounded-full bg-paper-200 ${className}`} />;
  return (
    <img
      src={src}
      alt={platform}
      className={`object-contain ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
