import Card from '../../../components/ui/Card'
import StatusBadge from '../../../components/ui/StatusBadge'
import Button from '../../../components/ui/Button'
import RefreshButton from './RefreshButton'
import Empty from '../../../components/ui/Empty'
import AutoReload from './AutoReload'

export default async function ProgressPage() {
  let data: any = null
  try {
    const res = await fetch('http://localhost:4000/admin/progress', { next: { revalidate: 60 } })
    if (res.ok) data = await res.json()
  } catch {}

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">進捗（閲覧専用）</h2>
        <p className="text-sm text-ink-2">白・黒・グレーのみ。常時A11y配慮。</p>
        <div className="pt-2 flex items-center gap-2">
          <Button size="sm">主要アクション</Button>
          <Button variant="outline" size="sm">サブ</Button>
          <RefreshButton />
        </div>
      </header>

      <div className="grid gap-4">
        <Card className="p-4 bg-paper-2">
          <h3 className="text-sm font-medium mb-2">① いまやること</h3>
          <p className="text-sm text-ink-2">APIの進捗I/F（/admin/progress）を整備し、UIに表示できる形にする。</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">② 終わったらどうなる？</h3>
          <p className="text-sm text-ink-2">管理画面で現状と次の一手が5秒以内に確認できる。</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">③ 次にやること</h3>
          <ul className="list-disc pl-5 text-sm text-ink-2 space-y-1">
            <li>APIのダミー進捗を取得して表示（60秒キャッシュ）。</li>
            <li>チェックリストとリスクの簡易表示。</li>
            <li>CLI/CI との整合（ops/progress.yaml）。</li>
          </ul>
        </Card>
      </div>

      <section className="space-y-3" role="region" aria-label="APIからの進捗">
        <h3 className="text-sm font-medium">APIからの進捗</h3>
        {!data && (
          <p className="text-sm text-ink-2">読み込み中、またはAPIに接続できません。</p>
        )}
        {data && (
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-2">Phase</span>
              {(() => {
                const p = String(data.phase ?? 'N/A')
                const tone = p === 'A' ? 'ok' : (p === 'B' || p === 'C') ? 'warn' : 'default'
                return <StatusBadge tone={tone as any}>{`Phase ${p}`}</StatusBadge>
              })()}
            </div>
            <div>
              <div className="text-sm font-medium mb-1">completed_checklist</div>
              {Array.isArray(data.completed_checklist) && data.completed_checklist.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-ink-2 space-y-1">
                  {data.completed_checklist.map((it: any, i: number) => (
                    <li key={i}>{String(it)}</li>
                  ))}
                </ul>
              ) : (
                <Empty title="項目がありません" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium mb-1">next_actions</div>
              {Array.isArray(data.next_actions) && data.next_actions.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-ink-2 space-y-1">
                  {data.next_actions.map((it: any, i: number) => (
                    <li key={i}>{String(it)}</li>
                  ))}
                </ul>
              ) : (
                <Empty title="なし" />
              )}
            </div>
            <div>
              <div className="text-sm font-medium mb-1">risks</div>
              {Array.isArray(data.risks) && data.risks.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-ink-2 space-y-1">
                  {data.risks.map((it: any, i: number) => (
                    <li key={i}>{String(it)}</li>
                  ))}
                </ul>
              ) : (
                <Empty title="項目がありません" />
              )}
            </div>
          </Card>
        )}
      </section>
      <AutoReload intervalMs={60_000} />
    </section>
  )
}
