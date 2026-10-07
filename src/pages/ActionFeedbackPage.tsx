import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { defaultActionFeedback } from '../data/linHaoAction'
import type { Assessment } from '../state/useAssessment'
import type { ActionFeedback } from '../types/action'

const threadOptions: { value: ActionFeedback['threads']; label: string }[] = [
  { value: 'not_started', label: '还没有开始' }, { value: 'watched', label: '看过内容，但基本不会写' },
  { value: 'practiced', label: '理解基础概念，也写过几个简单例子，但还不熟' }, { value: 'independent', label: '可以独立完成常见基础练习' },
]
const mysqlOptions: { value: ActionFeedback['mysql']; label: string }[] = [
  { value: 'not_started', label: '没开始' }, { value: 'intro', label: '学了一部分，知道基本作用，但理解还不深' },
  { value: 'explained', label: '已经理解基础概念，可以解释常见使用场景' },
]
const difficultyOptions: { value: ActionFeedback['difficulty']; label: string }[] = [
  { value: 'slow', label: '内容理解比预期慢' }, { value: 'time', label: '时间不足' },
  { value: 'cannot_code', label: '知道概念但不会独立写' }, { value: 'too_many', label: '任务太多' }, { value: 'other', label: '其他' },
]

export function ActionFeedbackPage({ assessment }: { assessment: Assessment }) {
  const [draft, setDraft] = useState<ActionFeedback>(() => ({
    ...defaultActionFeedback,
    threads: assessment.currentAction?.removedTaskId === 'threads' ? 'not_started' : defaultActionFeedback.threads,
    mysql: assessment.currentAction?.removedTaskId === 'mysql' ? 'not_started' : defaultActionFeedback.mysql,
    algorithmCompleted: assessment.currentAction?.removedTaskId === 'algorithms' ? 0 : defaultActionFeedback.algorithmCompleted,
    algorithmIndependent: assessment.currentAction?.removedTaskId === 'algorithms' ? 0 : defaultActionFeedback.algorithmIndependent,
  }))
  const [error, setError] = useState('')
  const plan = assessment.currentAction
  if (!plan || plan.mode !== 'executable' || plan.feedbackKind !== 'lin_hao_java_core' || !plan.tasks.length || assessment.actionPeriod !== 'ended') return <div className="message-state page-enter"><h1>当前还没有可反馈的行动</h1><p>只有设定了具体目标和完成标准的行动，才能根据真实反馈更新诊断。</p></div>
  const algorithmError = draft.algorithmIndependent > draft.algorithmCompleted
  const submit = () => { if (algorithmError) { setError('独立完成数量不能超过实际完成数量'); return } setError(''); assessment.submitActionFeedback(draft) }
  return <div className="page-enter action-flow-page"><div className="page-heading"><div><span className="eyebrow">行动反馈</span><h1>这 {plan.days} 天，实际发生了什么？</h1><p>不需要为了“完成计划”而勾满所有选项。真实反馈会让下一次建议更准确。</p></div></div>
    <div className="feedback-stack">
      {plan.removedTaskId !== 'threads' && <section className="surface feedback-panel"><h2>Java 多线程基础</h2><p>原计划：学习 Thread / Runnable，并完成基础练习。</p><h3>你现在更接近哪种状态？</h3><div className="supplement-choices">{threadOptions.map(option => <label key={option.value} className={`supplement-option ${draft.threads === option.value ? 'selected' : ''}`}><input type="radio" name="threads-feedback" checked={draft.threads === option.value} onChange={() => setDraft({ ...draft, threads: option.value })}/><span className="supplement-option-copy"><strong>{option.label}</strong></span></label>)}</div><label className="feedback-note">补充说明<textarea value={draft.threadsNote} onChange={event => setDraft({ ...draft, threadsNote: event.target.value })}/></label></section>}
      {plan.removedTaskId !== 'mysql' && <section className="surface feedback-panel"><h2>MySQL 索引基础</h2><p>原计划：理解索引的作用、场景与使用边界。</p><h3>你现在更接近哪种状态？</h3><div className="supplement-choices">{mysqlOptions.map(option => <label key={option.value} className={`supplement-option ${draft.mysql === option.value ? 'selected' : ''}`}><input type="radio" name="mysql-feedback" checked={draft.mysql === option.value} onChange={() => setDraft({ ...draft, mysql: option.value })}/><span className="supplement-option-copy"><strong>{option.label}</strong></span></label>)}</div><label className="feedback-note">补充说明<textarea value={draft.mysqlNote} onChange={event => setDraft({ ...draft, mysqlNote: event.target.value })}/></label></section>}
      {plan.removedTaskId !== 'algorithms' && <section className="surface feedback-panel"><h2>基础算法</h2><p>原计划：{plan.algorithmTarget} 道数组 / 字符串基础题。</p><div className="feedback-numbers"><label>实际完成<input type="number" min="0" max="30" value={draft.algorithmCompleted} onChange={event => setDraft({ ...draft, algorithmCompleted: Number(event.target.value) })}/>道</label><label>其中独立完成<input type="number" min="0" max="30" value={draft.algorithmIndependent} onChange={event => setDraft({ ...draft, algorithmIndependent: Number(event.target.value) })}/>道</label></div>{algorithmError && <span className="field-error" role="alert">独立完成数量不能超过实际完成数量</span>}</section>}
      <section className="surface feedback-panel"><h2>本周主要困难</h2><p>这一周最大的困难是什么？</p><div className="supplement-choices">{difficultyOptions.map(option => <label key={option.value} className={`supplement-option ${draft.difficulty === option.value ? 'selected' : ''}`}><input type="radio" name="difficulty" checked={draft.difficulty === option.value} onChange={() => setDraft({ ...draft, difficulty: option.value })}/><span className="supplement-option-copy"><strong>{option.label}</strong></span></label>)}</div></section>
      <div className="surface feedback-trust"><strong>提交后将更新</strong><p>你的已确认事实、当前差距状态和下一阶段优先级。“学过”不会自动等于“已掌握”。</p></div>
      {error && <span className="field-error" role="alert">{error}</span>}<button className="button primary feedback-submit" disabled={algorithmError || draft.algorithmCompleted < 0 || draft.algorithmIndependent < 0} onClick={submit}>更新我的准备状态 <ArrowRight size={16}/></button>
    </div>
  </div>
}
