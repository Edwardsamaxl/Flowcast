import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-paper-50 px-4 text-ink-950">
      <div className="max-w-lg rounded-card border border-paper-200 bg-paper-0 p-8 shadow-float">
        <p className="text-sm font-medium text-seal-600">页面不存在</p>
        <h1 className="mt-3 font-editorial text-4xl font-semibold leading-tight">这条表达资产还没建立</h1>
        <p className="mt-4 text-sm leading-6 text-ink-600">
          当前链接没有对应页面。回到资产库继续上传内容、整理画像或拆解视频。
        </p>
        <Link
          href="/library"
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          回到资产库
        </Link>
      </div>
    </main>
  );
}
