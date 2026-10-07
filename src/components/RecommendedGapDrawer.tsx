import { useEffect } from 'react'
import { X } from 'lucide-react'
import { DrawerPortal } from './DrawerPortal'
import type { DiagnosisRecommendation } from '../types/case'

export function RecommendedGapDrawer({ current, recommended, onKeep, onUse }: {
  current: DiagnosisRecommendation
  recommended: DiagnosisRecommendation
  onKeep: () => void
  onUse: () => void
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onKeep() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onKeep])
  return <DrawerPortal><div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onKeep() }}>
    <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="recommended-gap-title">
      <div className="drawer-header"><div><span className="eyebrow">建议对照</span><h2 id="recommended-gap-title">查看系统推荐项</h2><p>先看建议依据，决定权仍在你。</p></div><button className="icon-button" aria-label="关闭推荐项" onClick={onKeep}><X size={20}/></button></div>
      <div className="drawer-content"><section className="drawer-section"><span className="layer-number">01 / 系统推荐</span><div className="evidence-line"><div><strong>{recommended.title}</strong><span className={`badge priority-${recommended.priority}`}>{recommended.priority} · 可执行首选</span></div></div><p className="muted">Java 核心基础和 MySQL 基础仍存在更优先的已确认差距；当前首位已有具体任务和完成标准，可以进入行动周期。</p></section><section className="drawer-section"><span className="layer-number">02 / 当前选择</span><div className="evidence-line"><div><strong>{current.title}</strong><span className={`badge priority-${current.priority}`}>{current.priority} · 当前选择</span></div></div></section></div>
      <div className="drawer-actions"><button className="button secondary" onClick={onKeep}>保持当前选择</button><button className="button primary" onClick={onUse}>改用推荐项</button></div>
    </aside>
  </div></DrawerPortal>
}
