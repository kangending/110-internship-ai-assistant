import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { DrawerPortal } from './DrawerPortal'
import type { ActionPlan, ActionTask } from '../types/action'

export function ActionAdjustmentDrawer({ plan, onClose, onSave }: { plan: ActionPlan; onClose: () => void; onSave: (plan: ActionPlan) => void }) {
  const [draft, setDraft] = useState(plan)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])
  return <DrawerPortal><div className="overlay drawer-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="drawer action-adjustment-drawer" role="dialog" aria-modal="true" aria-labelledby="adjust-title">
      <div className="drawer-header"><div><span className="eyebrow">调整行动</span><h2 id="adjust-title">只调整本周期的范围</h2><p>调整行动不会直接改变岗位差距判断，后续仍以实际反馈为准。</p></div><button className="icon-button" aria-label="关闭" onClick={onClose}><X size={20}/></button></div>
      <div className="drawer-content action-adjust-content">
        {plan.mode === 'executable' && <fieldset className="supplement-group"><legend>周期</legend><div className="supplement-choices">{([7, 10] as const).map(days => <label key={days} className={`supplement-option ${draft.days === days ? 'selected' : ''}`}><input type="radio" name="days" checked={draft.days === days} onChange={() => setDraft({ ...draft, days })}/><span className="supplement-option-copy"><strong>{days} 天</strong></span></label>)}</div></fieldset>}
        {plan.tasks.some(task => task.id === 'algorithms' && draft.removedTaskId !== task.id) && <fieldset className="supplement-group"><legend>算法题数量</legend><div className="supplement-choices">{[3, 5, 7].map(count => <label key={count} className={`supplement-option ${draft.algorithmTarget === count ? 'selected' : ''}`}><input type="radio" name="algorithms" checked={draft.algorithmTarget === count} onChange={() => setDraft({ ...draft, algorithmTarget: count })}/><span className="supplement-option-copy"><strong>{count} 道</strong></span></label>)}</div></fieldset>}
        {plan.tasks.length > 1 && <fieldset className="supplement-group"><legend>本周期暂时移除</legend><div className="supplement-choices">{[{ id: null, title: '不移除' }, ...plan.tasks.map(task => ({ id: task.id, title: task.title }))].map(item => <label key={item.id ?? 'none'} className={`supplement-option ${draft.removedTaskId === item.id ? 'selected' : ''}`}><input type="radio" name="remove" checked={draft.removedTaskId === item.id} onChange={() => setDraft({ ...draft, removedTaskId: item.id as ActionTask['id'] | null })}/><span className="supplement-option-copy"><strong>{item.title}</strong></span></label>)}</div></fieldset>}
      </div>
      <div className="drawer-actions"><button className="button secondary" onClick={onClose}>取消</button><button className="button primary" onClick={() => onSave(draft)}>保存调整</button></div>
    </aside>
  </div></DrawerPortal>
}
