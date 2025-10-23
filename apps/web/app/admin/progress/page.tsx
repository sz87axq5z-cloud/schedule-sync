import Card from '../../../components/ui/Card'
import StatusBadge from '../../../components/ui/StatusBadge'
import Button from '../../../components/ui/Button'
import RefreshButton from './RefreshButton'
import Empty from '../../../components/ui/Empty'
import AutoReload from './AutoReload'
import ToastDemo from './ToastDemo'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/Tooltip'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog'
import PhaseSelect from './PhaseSelect'

export default async function ProgressPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  let data: any = null
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
    const res = await fetch(`${base}/admin/progress`, { next: { revalidate: 60 } })
    if (res.ok) data = await res.json()
  } catch {}

  const spPhase = searchParams && typeof searchParams["phase"] === 'string' ? (searchParams["phase"] as string) : Array.isArray(searchParams?.["phase"]) ? String((searchParams?.["phase"] as string[])[0]) : undefined
  const phaseFilter = spPhase ?? 'all'
  const visible = phaseFilter === 'all' || (data && String(data.phase) === phaseFilter)

  return (
    <section className="space-y-section">
      <header className="space-y-2">
        <h2 className="text-title font-semibold tracking-tight">進捗（閲覧専用）</h2>
        <p className="text-body text-ink-2">白・黒・グレーのみ。常時A11y配慮。</p>
        <TooltipProvider>
          <div className="pt-2 flex items-center gap-2">
            <Button size="sm">主要アクション</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" aria-label="補助アクションの説明">サブ</Button>
              </TooltipTrigger>
              <TooltipContent>補助的な操作です。安全に取り消せます。</TooltipContent>
            </Tooltip>
            <RefreshButton />
            <ToastDemo />
            <PhaseSelect />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">詳細を見る</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>進捗の詳細</DialogTitle>
                  <DialogDescription>APIから取得したチェックリストと次の一手</DialogDescription>
                </DialogHeader>
                {!data && (
                  <p className="text-sm text-ink-2">データが読み込めませんでした。</p>
                )}
                {data && (
                  <div className="grid gap-4">
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
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </TooltipProvider>
      </header>

      <div className="grid gap-element">
        <Card className="p-4 bg-paper-2">
          <h3 className="text-sm font-medium mb-element2">① いまやること</h3>
          <p className="text-body text-ink-2">APIの進捗I/F（/admin/progress）を整備し、UIに表示できる形にする。</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-element2">② 終わったらどうなる？</h3>
          <p className="text-body text-ink-2">管理画面で現状と次の一手が5秒以内に確認できる。</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium mb-element2">③ 次にやること</h3>
          <ul className="list-disc pl-5 text-body text-ink-2 space-y-1">
            <li>APIのダミー進捗を取得して表示（60秒キャッシュ）。</li>
            <li>チェックリストとリスクの簡易表示。</li>
            <li>CLI/CI との整合（ops/progress.yaml）。</li>
          </ul>
        </Card>
      </div>

      <section className="space-y-element" role="region" aria-label="APIからの進捗">
        <h3 className="text-sm font-medium">APIからの進捗</h3>
        {!data && (
          <p className="text-body text-ink-2">読み込み中、またはAPIに接続できません。</p>
        )}
        {data && visible && (
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
        {data && !visible && (
          <Card className="p-4">
            <p className="text-sm text-ink-2">フェーズフィルタ（{phaseFilter}）により非表示です。</p>
          </Card>
        )}
      </section>
      <AutoReload intervalMs={60_000} />
    </section>
  )
}
