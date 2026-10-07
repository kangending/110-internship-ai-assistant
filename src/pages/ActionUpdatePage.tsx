import { useState } from 'react'
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleCheckBig, Minus } from 'lucide-react'
import { GapBadge, SourceBadge } from '../components/Badges'
import { LoadingState } from '../components/LoadingState'
import { CompletionDialog } from '../components/CompletionDialog'
import { linHaoCase } from '../data/linHao'
import { navigate } from '../state/useAssessment'
import type { Assessment } from '../state/useAssessment'

type ChangeKind = 'improved' | 'unchanged' | 'regressed' | 'informational'
const gapOrder = { gap: 1, partial: 2, met: 3 }
function gapChange(before: string | undefined, after: string | undefined): ChangeKind {
  if (before === after) return 'unchanged'
  const oldRank = gapOrder[before as keyof typeof gapOrder]
  const newRank = gapOrder[after as keyof typeof gapOrder]
  if (!oldRank || !newRank) return 'informational'
  return newRank > oldRank ? 'improved' : 'regressed'
}

export function ActionUpdatePage({ assessment }: { assessment: Assessment }) {
  const [completionOpen, setCompletionOpen] = useState(false)
  if (assessment.stage === 'updating') return <LoadingState actionFeedback periodDays={assessment.currentAction?.days} />
  if (!assessment.updatedDiagnosis || !assessment.actionFeedback) return <div className="message-state page-enter"><h1>还没有本次更新</h1><p>提交行动反馈后，新的事实和建议会显示在这里。</p></div>
  const facts = assessment.postActionFacts
  const advanced = assessment.updatedDiagnosis.recommendations.find(item => item.id === 'after-java')?.gapStatus === 'partial'
  const feedback = assessment.actionFeedback
  const latestTop = assessment.updatedDiagnosis.recommendations[0]
  const latestJava = assessment.updatedDiagnosis.recommendations.find(item => item.id === 'after-java')
  const previousJava = linHaoCase.revisedDiagnosis.recommendations.find(item => item.id === 'after-java')
  const statusLabel = (status: string) => ({ gap: '当前缺口', partial: '部分满足', met: '已满足', unknown: '信息不足' })[status as 'gap' | 'partial' | 'met' | 'unknown'] ?? status
  const changes: { title: string; before: string; after: string; reason: string; kind: ChangeKind; stateNote: string }[] = [
    { title: 'Java 核心基础', before: 'gap · 当前缺口', after: advanced ? 'partial · 部分满足' : 'gap · 当前缺口', kind: gapChange(previousJava?.gapStatus, latestJava?.gapStatus), stateNote: advanced ? '能力状态改善' : '状态未变化 · 仍为当前缺口', reason: advanced ? '已经完成多线程基础入门并进行简单编码练习，但实际编码仍不熟练。' : '当前反馈还不足以说明已完成基础编码练习，仍需先巩固 Java 多线程。' },
    { title: 'MySQL 基础', before: '只会 CRUD', after: feedback.mysql === 'not_started' ? '仍以 CRUD 为主' : '已接触索引', kind: feedback.mysql === 'not_started' ? 'unchanged' : 'informational', stateNote: feedback.mysql === 'not_started' ? '状态未变化' : '事实有更新 · 状态仍为部分满足', reason: feedback.mysql === 'not_started' ? '本周期尚未开始索引学习；状态仍为 partial。' : '状态仍为 partial；事务和进一步实践仍不足。' },
    { title: '基础算法', before: '刚开始练习', after: feedback.algorithmCompleted ? `完成 ${feedback.algorithmCompleted} 道，其中 ${feedback.algorithmIndependent} 道独立完成` : '本周期没有新增练习', kind: feedback.algorithmCompleted ? 'informational' : 'unchanged', stateNote: feedback.algorithmCompleted ? '新增练习事实 · 尚不能判定能力升级' : '状态未变化', reason: feedback.algorithmCompleted ? '继续保持持续练习 / partial，不能仅凭一次练习判断已满足岗位要求。' : '当前没有足够的新事实判断算法掌握程度。' },
  ]
  return <div className="page-enter action-flow-page"><div className="page-heading"><div><span className="eyebrow info-eyebrow">本次更新</span><h1>{advanced ? '你的位置变了，下一步也该变了' : '已记录真实反馈，继续明确下一步'}</h1><p>{advanced ? '根据本次行动反馈，已确认事实和下一阶段建议已更新。' : '本次反馈已记录；能力状态是否变化，仍以明确事实为依据。'}</p></div></div>
    <div className="stack"><section className="surface action-panel"><h2>这 {assessment.completedActionDays} 天，我们新知道了这些</h2><div className="new-facts">{facts.map(fact => <div key={fact.id} className="new-fact"><div><span className="badge status-confirmed">已确认</span><strong>{fact.statement}</strong></div><SourceBadge source={fact.source}/></div>)}</div></section>
      <section className="diff-section action-update-diff"><div className="section-heading"><div><span className="eyebrow">变化记录</span><h2>和 {assessment.completedActionDays} 天前相比</h2></div></div><div className="diff-list">{changes.map(item => <div className="surface diff-row update-diff-row" key={item.title}><div className="diff-before"><span className="muted-label">{item.title} · 之前</span><strong>{item.before}</strong></div><ArrowRight className="diff-arrow" size={18}/><div className="diff-after"><span className="muted-label">现在</span><strong>{item.after}</strong></div>{item.kind === 'improved' ? <ArrowUpRight className="change-up" size={18}/> : item.kind === 'regressed' ? <ArrowDownRight className="change-down" size={18}/> : item.kind === 'informational' ? <ArrowRight className="change-info" size={18}/> : <Minus className="change-unchanged" size={18}/>}<p><span className={`change-note ${item.kind}`}>{item.stateNote}</span> · {item.reason}</p></div>)}</div></section>
      <section className="surface action-panel next-phase"><span className="eyebrow">下一阶段</span><div className="action-panel-head"><h2>{advanced ? 'Spring Boot 基础' : '继续巩固 Java 核心基础'}</h2><span className="badge priority-P0">P0 · 当前主线</span></div><h3>为什么现在可以开始？</h3><p>{advanced ? 'Java 核心基础已经从明显缺口进入部分满足；你完成了多线程基础入门与代码练习。距离投递时间继续缩短，可以开始建立后端框架学习链路。' : '目前仍需要更多 Java 多线程编码练习，先巩固基础再进入框架学习。'}</p><div className="notice warning"><div><strong>这不代表 Java 已经学完</strong><p>并行保持 Java 多线程练习每周 2 次、基础算法每周约 4～5 道；MySQL 可在 Spring Boot / MyBatis 学习与项目中继续深化。</p></div></div><div className="button-row"><GapBadge status={advanced ? 'partial' : 'gap'}/><span className="muted">Java 核心基础仍需继续巩固</span></div></section>
      <section className="surface cycle-complete"><div className="completion-status"><CircleCheckBig size={25} aria-hidden="true"/><span className="badge status-confirmed">闭环完成</span></div><span className="eyebrow">本轮准备已完成</span><h2>你已经完成了一次完整的准备闭环</h2><p>从第一次诊断到本次更新，你已经完成了从判断差距到验证行动结果的完整过程。下一轮由你决定是否开始。</p><div className="cycle-result-grid"><div className="cycle-result"><span>最初的问题</span><strong>不知道 Java 后端实习当前最应该先补什么</strong></div><div className="cycle-result"><span>这次发生的变化</span><strong>Java 核心基础</strong><small>{previousJava ? statusLabel(previousJava.gapStatus) : '当前缺口'} → {latestJava ? statusLabel(latestJava.gapStatus) : '待确认'}</small></div><div className="cycle-result"><span>现在最重要的下一步</span><strong>{latestTop.title}</strong><small>{latestTop.priority} · {latestTop.rank === 1 ? '当前主线' : '最新诊断'}</small></div></div><div className="cycle-steps" aria-label="本轮准备步骤">{['明确岗位要求', '纠正 AI 理解', '找到关键差距', '完成可验证行动', '根据真实结果更新建议'].map((step, index) => <span key={step}><b>{index + 1}</b>{step}</span>)}</div><div className="button-row"><button className="button primary" onClick={() => setCompletionOpen(true)}>完成本轮体验 <ArrowRight size={16}/></button><button className="button secondary" onClick={() => navigate('diagnosis')}>查看最新诊断</button><button className="button ghost" onClick={() => assessment.continueNext(false)}>规划下一轮</button></div></section>
    </div>
    {completionOpen && assessment.hasCompletedVerifiedCycle && <CompletionDialog assessment={assessment} onClose={() => setCompletionOpen(false)}/>}
  </div>
}
