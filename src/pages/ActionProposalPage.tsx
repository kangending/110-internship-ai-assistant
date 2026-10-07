import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Check, CircleCheckBig, SlidersHorizontal } from 'lucide-react'
import { ActionAdjustmentDrawer } from '../components/ActionAdjustmentDrawer'
import { ContextRail, RailCard } from '../components/ContextRail'
import { createActionPlan } from '../data/linHaoAction'
import type { Assessment } from '../state/useAssessment'
import type { ActionTask } from '../types/action'
import { navigate } from '../state/useAssessment'

export function ActionProposalPage({ assessment }: { assessment: Assessment }) {
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false)
  const [directionCompletionOpen, setDirectionCompletionOpen] = useState(assessment.proposedAction?.mode === 'direction')
  const plan = assessment.proposedAction
  const latest = assessment.effectiveDiagnosis.recommendations
  const selected = latest.find(item => item.id === assessment.selectedGapId)
  const directionOnly = plan?.mode === 'direction'
  const currentMainline = selected?.rank === 1
  useEffect(() => {
    if (!directionCompletionOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setDirectionCompletionOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [directionCompletionOpen])
  if (!plan) return <div className="page-enter"><div className="page-heading"><div><span className="eyebrow">下一步行动</span><h1>先选择一个当前差距</h1><p>根据最新诊断，决定下一阶段想处理的方向。</p></div></div><div className="surface action-panel"><div className="action-choice-list">{latest.map(item => <button key={item.id} className="action-option" onClick={() => { assessment.chooseGap(item.id); if (createActionPlan(item.id).mode === 'direction') setDirectionCompletionOpen(true) }}><span>{item.title}</span><small>{item.priority}{item.rank === 1 ? ' · 推荐' : ''}</small></button>)}</div></div></div>
  const tasks = plan.tasks.filter(task => task.id !== plan.removedTaskId)
  const reviewingCurrentPlan = assessment.actionOrigin === 'proposal' && assessment.currentAction?.id === plan.id
  return <div className="page-enter action-flow-page">
    <div className="page-heading"><div><span className="eyebrow">下一步行动</span><h1>{directionOnly ? '本次诊断已经完成' : `这 ${plan.days} 天，先解决一个主要问题`}</h1><p>{directionOnly ? '你当前最值得继续推进的方向已经明确。' : '与其同时推进很多内容，不如先完成一个能够改变下一次诊断的行动。'}</p></div></div>
    {notice && <div className="notice success"><Check size={17}/><div><strong>{notice}</strong><p>本次调整不会直接改变岗位差距判断，后续仍以实际反馈为准。</p></div></div>}
    <div className="content-grid"><div className="stack">
      <section className="surface action-panel"><div className="action-panel-head"><div><span className="eyebrow">{directionOnly ? '当前方向' : '当前选择'}</span><h2>{selected?.title ?? plan.title}</h2></div><span className={`badge priority-${selected?.priority ?? 'P0'}`}>{directionOnly ? `${selected?.priority ?? 'P1'} · ${currentMainline ? '当前主线' : '下一阶段方向'}` : assessment.hasCompletedVerifiedCycle && !currentMainline ? `${selected?.priority} · 可选巩固` : `${selected?.priority ?? 'P0'}${currentMainline ? ' · 推荐' : ''}`}</span></div><p>{directionOnly ? '当前原型尚未为这一方向配置可验证的具体行动方案，因此不会直接进入行动周期。' : '围绕已选择的差距，把下一个周期限定为一件主要的事。'}</p>{plan.mode === 'executable' && <><h3>{plan.title}</h3><div className="action-meta"><span>{plan.days} 天</span><span>关联差距：{selected?.title ?? plan.title}</span></div></>}</section>
      {directionOnly && <section className="surface action-panel next-direction-state"><span className="eyebrow info-eyebrow">诊断状态</span><h2>为什么本次可以在这里结束？</h2><p>你的下一阶段方向已经明确。为了保持判断真实，系统不会为了继续流程而生成没有依据的行动任务，也不会把你重新推荐回已经具备的基础能力。</p><p className="direction-demo-highlight">当前原型已为“Java 核心基础”配置了一条完整的可验证行动模拟案例。如果你希望体验从诊断纠错、制定行动到反馈更新的完整流程，可以选择「<strong>体验完整模拟闭环</strong>」。系统会载入预设的标准演示路径。</p></section>}
      {tasks.length > 0 && <section className="action-task-list"><div className="section-heading"><div><h2>本周期行动</h2><p>每一项都写明目标与完成标准。</p></div></div>{tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index + 1} algorithmTarget={plan.algorithmTarget}/>)}</section>}
      {directionOnly ? <div className="button-row"><button className="button primary" onClick={() => navigate('diagnosis')}>查看本次诊断结果 <ArrowRight size={16}/></button><button className="button direction-demo-cta" onClick={() => setDemoSwitchOpen(true)}>体验完整模拟闭环</button></div> : reviewingCurrentPlan ? <div className="button-row"><button className="button primary" onClick={() => navigate('action')}>返回当前行动 <ArrowRight size={16}/></button></div> : <div className="button-row"><button className="button primary" onClick={() => setConfirmOpen(true)}>设为当前行动 <ArrowRight size={16}/></button><button className="button secondary" onClick={() => setAdjustOpen(true)}><SlidersHorizontal size={16}/> 调整行动</button></div>}
    </div><ContextRail><RailCard title="为什么现在做？"><strong>{selected?.title ?? plan.title}</strong><p>{selected?.priority ?? 'P0'} · {currentMainline ? '当前主线' : '当前已选择'}</p>{plan.gapId === 'after-java' && !assessment.hasCompletedVerifiedCycle && <p>Java 核心基础 P0 · MySQL 基础 P0</p>}</RailCard><RailCard title="准备条件"><p>距离投递约 {assessment.form.months || '4'} 个月</p><p>每周可投入 {assessment.form.hours || '20'}h</p></RailCard><RailCard title="本阶段取舍"><p>{directionOnly ? '本次诊断已明确所选方向；是否体验完整模拟闭环由你决定。' : assessment.hasCompletedVerifiedCycle ? '本轮准备闭环已完成，是否开始下一轮由你决定。' : '优先补齐进入框架学习前的核心基础，避免同时开启过多学习主线。'}</p></RailCard></ContextRail></div>
    {adjustOpen && plan.mode === 'executable' && <ActionAdjustmentDrawer plan={plan} onClose={() => setAdjustOpen(false)} onSave={next => { assessment.adjustProposal(next); setAdjustOpen(false); setNotice('当前行动已调整') }}/>} 
    {directionCompletionOpen && directionOnly && createPortal(<div className="overlay completion-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setDirectionCompletionOpen(false) }}><div className="dialog completion-dialog direction-completion-dialog" role="dialog" aria-modal="true" aria-labelledby="direction-completion-title"><div className="completion-status"><CircleCheckBig size={23} aria-hidden="true"/><span className="badge status-confirmed">{assessment.hasCompletedVerifiedCycle ? '本轮已完成' : '本次诊断已完成'}</span></div><h2 id="direction-completion-title">下一阶段方向已经明确</h2>{assessment.hasCompletedVerifiedCycle ? <><p>你已经完成上一轮诊断、行动与反馈更新。当前下一阶段方向已明确为「{selected?.title ?? plan.title}」。</p><p>当前可以在这里结束本轮准备，之后再根据需要继续规划新的行动。</p></> : <><p>根据当前已确认的信息，你下一阶段最值得继续推进的方向已经明确为「{selected?.title ?? plan.title}」。</p><p>当前原型尚未为这一方向配置可验证的具体行动方案，因此不会为了继续流程而生成没有依据的行动任务。</p><p>你可以在这里结束本次诊断；如果希望继续体验诊断纠错、行动反馈与建议更新的完整流程，可以载入标准模拟案例。</p></>}<div className="dialog-actions completion-actions"><button className="button primary" onClick={() => { setDirectionCompletionOpen(false); navigate('diagnosis') }}>{assessment.hasCompletedVerifiedCycle ? '查看最新诊断' : '查看本次诊断结果'}</button>{assessment.hasCompletedVerifiedCycle ? <button className="button secondary" onClick={() => { setDirectionCompletionOpen(false); navigate('home') }}>返回首页</button> : <button className="button primary" onClick={() => { setDirectionCompletionOpen(false); setDemoSwitchOpen(true) }}>体验完整模拟闭环</button>}</div></div></div>, document.body)}
    {demoSwitchOpen && createPortal(<div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) setDemoSwitchOpen(false) }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="demo-switch-title"><span className="eyebrow">模拟案例</span><h2 id="demo-switch-title">体验完整模拟闭环？</h2><p>当前诊断结果已经保留。</p><p>接下来将载入“林浩·基础阶段”标准模拟案例，并预设关键演示选择，帮助你完整体验：诊断纠错 → 制定行动 → 行动反馈 → 更新诊断</p><p>预设选项仍可修改；修改后可能进入其他诊断分支。</p><div className="dialog-actions"><button className="button secondary" onClick={() => setDemoSwitchOpen(false)}>取消</button><button className="button primary" onClick={() => { setDemoSwitchOpen(false); assessment.beginStandardDemo() }}>载入标准模拟案例</button></div></div></div>, document.body)}
    {confirmOpen && plan.mode === 'executable' && <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmOpen(false) }}><div className="dialog action-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title"><span className="eyebrow">未来 {plan.days} 天主行动</span><h2 id="confirm-action-title">{plan.title}</h2><p>包含：{tasks.map(task => task.id === 'algorithms' ? `${plan.algorithmTarget} 道算法题` : task.title.replace('基础', '')).join('、')}。</p><div className="dialog-actions"><button className="button secondary" onClick={() => { setConfirmOpen(false); setAdjustOpen(true) }}>继续调整</button><button className="button primary" onClick={() => { setConfirmOpen(false); assessment.startAction() }}>确认开始</button></div></div></div>}
  </div>
}

export function TaskCard({ task, index, algorithmTarget }: { task: ActionTask; index: number; algorithmTarget: number }) {
  return <article className="surface action-task-card"><div className="action-task-head"><span className="section-number">{index}</span><h3>{task.title}</h3></div><div className="action-task-detail"><strong>目标</strong><p>{task.id === 'algorithms' ? `完成 ${algorithmTarget} 道数组 / 字符串基础题。` : task.goal}</p></div><div className="action-task-detail"><strong>完成标准</strong><ul>{task.criteria.map(criteria => <li key={criteria}>{task.id === 'algorithms' ? criteria.replace('3 道', `${Math.min(3, algorithmTarget)} 道`) : criteria}</li>)}</ul></div></article>
}
