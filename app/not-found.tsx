import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-canvas-50 px-4 text-ink-950">
      <div className="max-w-lg rounded-card bg-surface-0 p-8 shadow-float">
        <p className="text-sm font-medium text-calibrate-600">页面不存在</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.022em]">这条表达资产还没建立</h1>
        <p className="mt-4 text-sm leading-6 text-ink-600">
          当前链接没有对应页面。回到工作台继续上传内容、整理画像或生成草稿。
        </p>
        <Link
          href="/library"
          className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-button bg-calibrate-500 px-4 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          回到资产库
        </Link>
      </div>
    </main>
  );
}
