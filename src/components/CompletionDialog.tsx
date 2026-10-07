import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheckBig } from 'lucide-react'
import { navigate, type Assessment } from '../state/useAssessment'

export function CompletionDialog({ assessment, onClose, exploreAdjust = false }: { assessment: Assessment; onClose: () => void; exploreAdjust?: boolean }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])
  const go = (action: () => void) => { onClose(); action() }
  return createPortal(<div className="overlay completion-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="dialog completion-dialog" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="completion-status"><CircleCheckBig size={23} aria-hidden="true"/><span className="badge status-confirmed">本轮已完成</span></div>
      <h2 id="completion-title">本轮诊断与行动已完成</h2>
      <p>你已经完成了从岗位差距判断到行动反馈更新的一轮准备过程。</p>
      <p className="completion-path">诊断 → 纠正 → 重新规划 → 行动 → 真实反馈 → 更新诊断</p>
      <p>当前结果已经保存。你可以查看最新诊断，也可以稍后再继续规划下一阶段。</p>
      <div className="dialog-actions completion-actions">
        <button className="button primary" onClick={() => go(() => navigate('diagnosis'))}>查看最新诊断</button>
        <button className="button secondary" onClick={() => go(() => navigate('home'))}>返回首页</button>
        <button className="button ghost" onClick={() => go(() => assessment.continueNext(exploreAdjust))}>继续规划下一轮</button>
      </div>
    </div>
  </div>, document.body)
}
