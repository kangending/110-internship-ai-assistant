import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { DrawerPortal } from './DrawerPortal'
import type { DiagnosisHistoryEntry } from '../types/action'

export function DiagnosisHistoryDrawer({ entries, onClose }: { entries: DiagnosisHistoryEntry[]; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(entries[0]?.id ?? null)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])
  return <DrawerPortal><div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="history-title"><div className="drawer-header"><div><span className="eyebrow info-eyebrow">变化记录</span><h2 id="history-title">关键判断如何变化</h2><p>当前状态会更新，关键决策仍然保留。</p></div><button className="icon-button" aria-label="关闭变化记录" onClick={onClose}><X size={20}/></button></div><div className="drawer-content history-list">{entries.map(entry => <section className="surface history-card" key={entry.id}><button className="history-card-toggle" aria-expanded={expanded === entry.id} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}><strong>{entry.title}</strong><span>{expanded === entry.id ? '收起' : '查看依据'}</span></button><div className="history-summary">{entry.summary.map(line => <span key={line} className={line.includes('gap → partial') || line.includes('闭环完成') ? 'improved' : line.includes('当前主线') ? 'informational' : ''}>{line}</span>)}</div>{expanded === entry.id && <div className="history-details"><strong>当时为什么这样判断</strong><p>{entry.reason}</p><strong>当时选择的行动</strong><p>{entry.selectedAction}</p></div>}</section>)}</div></aside></div></DrawerPortal>
}
