import { AppShell } from "@/components/app-shell";
import { IconPill, SectionTitle } from "@/components/ui";
import { VoiceProfile } from "@/components/voice-profile";
import { platformRules, transcripts } from "@/lib/data";

export default function LibraryPage() {
  return (
    <AppShell
      eyebrow="表达资产库"
      title="把散落的观点、案例和禁用词沉淀下来"
      description="这里是 MVP 的核心资产页，后续可以接 SQLite 与 LLM 画像生成。"
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section>
          <SectionTitle title="视频与案例库" description="历史转录内容先作为案例库使用，每条内容都能提取观点、语气和反复出现的判断标准。" />
          <div className="space-y-3">
            {transcripts.map((item) => (
              <article key={item.id} className="rounded-card bg-surface-0 p-5 shadow-ring">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.012em]">{item.title}</h2>
                    <p className="mt-1 text-xs text-ink-400">{item.source} · {item.duration}</p>
                  </div>
                  <span className="rounded-tag bg-surface-50 px-2.5 py-1 text-xs font-medium text-ink-600">{item.status}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-600 pretty">{item.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.signals.map((signal) => (
                    <span key={signal} className="rounded-tag bg-calibrate-50 px-2.5 py-1 text-xs text-calibrate-600">
                      {signal}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <VoiceProfile />

          <div className="mt-6">
            <SectionTitle title="平台写法规则" />
            <div className="grid gap-3">
              {Object.entries(platformRules).map(([key, rule]) => (
                <div key={key} className="rounded-card bg-surface-0 p-4 shadow-ring">
                  <IconPill icon={rule.icon}>{rule.name}</IconPill>
                  <p className="mt-3 text-sm leading-6 text-ink-600">{rule.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
