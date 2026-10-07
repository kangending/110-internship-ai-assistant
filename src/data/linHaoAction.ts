import { linHaoCase } from './linHao'
import type { ActionFeedback, ActionOutcome, ActionPlan, ActionTask, DiagnosisHistoryEntry } from '../types/action'
import type { ConfirmedInformation, DiagnosisSnapshot } from '../types/case'

export const actionTasks: ActionTask[] = [
  { id: 'threads', title: 'Java 多线程基础', goal: '学习 Thread / Runnable 的基本使用，并完成简单线程练习。', criteria: ['能说明 Thread 与 Runnable 的基本区别。', '能独立写出 2 个基础线程示例。'] },
  { id: 'mysql', title: 'MySQL 索引基础', goal: '理解索引的基本作用、常见使用场景，以及为什么不能滥建索引。', criteria: ['能够用自己的话解释索引为什么能够帮助查询。'] },
  { id: 'algorithms', title: '基础算法', goal: '完成 5 道数组 / 字符串基础题。', criteria: ['至少 3 道可以独立完成。'] },
]

export function createActionPlan(gapId: string, selectedTitle?: string): ActionPlan {
  const chosen = [...linHaoCase.revisedDiagnosis.recommendations, ...linHaoCase.firstDiagnosis.recommendations]
    .find(item => item.id === gapId)
  const executable = gapId === 'after-java'
  return {
    id: `action-${gapId}`, gapId,
    title: executable ? '补齐进入后端框架前的核心基础' : `${selectedTitle ?? chosen?.title ?? '当前差距'} · 下一阶段行动`,
    mode: executable ? 'executable' : 'direction',
    feedbackKind: executable ? 'lin_hao_java_core' : null,
    days: 7, algorithmTarget: 5, removedTaskId: null,
    tasks: executable ? actionTasks : [],
  }
}

export function canStartAction(plan: ActionPlan): boolean {
  const activeTasks = plan.tasks.filter(task => task.id !== plan.removedTaskId)
  return plan.mode === 'executable' && plan.feedbackKind === 'lin_hao_java_core' &&
    activeTasks.length > 0 && activeTasks.every(task => !!task.goal.trim() &&
      task.criteria.length > 0 && task.criteria.every(criterion => !!criterion.trim()))
}

export const defaultActionFeedback: ActionFeedback = {
  threads: 'practiced',
  threadsNote: '我看完了基础视频，也写了几个 Thread 和 Runnable 的例子，但真正自己写还是不熟。',
  mysql: 'intro',
  mysqlNote: '知道为什么不能乱建索引，但是执行计划还没看懂。',
  algorithmCompleted: 5, algorithmIndependent: 3, difficulty: 'cannot_code',
}

export function buildActionOutcome(feedback: ActionFeedback): ActionOutcome {
  const facts: ConfirmedInformation[] = []
  const add = (id: string, topic: string, statement: string) => facts.push({ id, topic, statement, status: 'confirmed', source: 'action_feedback' })
  if (feedback.threads === 'watched') add('feedback-threads', 'Java 多线程', '看过 Java 多线程相关内容，但目前基本不会独立编写')
  if (feedback.threads === 'practiced' || feedback.threads === 'independent') {
    add('feedback-threads', 'Java 多线程', '已学习 Java 多线程基础')
    add('feedback-threads-examples', 'Java 多线程练习', '已写过 Thread / Runnable 基础示例')
    if (feedback.threads === 'practiced') add('feedback-threads-level', 'Java 多线程掌握程度', '当前多线程实际编码仍不熟练')
  }
  if (feedback.mysql === 'intro' || feedback.mysql === 'explained') {
    add('feedback-mysql', 'MySQL 索引', feedback.mysql === 'intro' ? '已接触 MySQL 索引基础，理解还不深' : '已理解 MySQL 索引基础，可以解释常见使用场景')
  }
  if (feedback.algorithmCompleted > 0) {
    add('feedback-algorithms', '基础算法', `完成 ${feedback.algorithmCompleted} 道基础算法题，其中 ${feedback.algorithmIndependent} 道独立完成`)
  }
  const advancedJava = feedback.threads === 'practiced' || feedback.threads === 'independent'
  const advancedMysql = feedback.mysql !== 'not_started'
  const base = linHaoCase.revisedDiagnosis
  const recommendations = base.recommendations.map(item => {
    if (item.id === 'after-java') return { ...item, rank: advancedJava ? 2 : 1, gapStatus: advancedJava ? 'partial' as const : item.gapStatus, priority: 'P0' as const, informationIds: advancedJava ? ['feedback-threads', 'feedback-threads-examples', ...(feedback.threads === 'practiced' ? ['feedback-threads-level'] : [])] : item.informationIds, reasons: advancedJava ? ['已完成多线程基础入门和简单编码练习，但实际编码仍需持续巩固。', 'Java 核心基础尚未完全掌握，继续每周练习。'] : item.reasons }
    if (item.id === 'after-mysql') return { ...item, rank: advancedJava ? 3 : 2, informationIds: advancedMysql ? ['feedback-mysql'] : item.informationIds, reasons: advancedMysql ? ['已接触索引基础，但事务和进一步实践仍不足。', '可在 Spring Boot / MyBatis 学习与项目中继续深化。'] : item.reasons }
    return { ...item, rank: advancedJava ? 1 : 3, title: advancedJava ? 'Spring Boot 基础' : item.title, priority: advancedJava ? 'P0' as const : item.priority, informationIds: advancedJava ? ['feedback-threads', 'feedback-threads-examples', ...(advancedMysql ? ['feedback-mysql'] : [])] : item.informationIds, reasons: advancedJava ? ['Java 核心基础已从明显缺口进入部分满足，并完成了多线程基础编码练习。', '距离投递时间继续缩短，可以开始建立后端框架学习链路；这不表示 Java 已经学完。'] : item.reasons }
  }).sort((a, b) => a.rank - b.rank)
  const diagnosis: DiagnosisSnapshot = { ...base, id: 'diagnosis-after-action', kind: 'post_action', replacesDiagnosisId: base.id, recommendations }
  return { facts, diagnosis }
}

export function buildDiagnosisHistory(afterAction: boolean, selectedAction: string, advancedJava: boolean, periodDays: number): DiagnosisHistoryEntry[] {
  return [
    ...(afterAction ? [{ id: 'post-action', title: `第 2 次诊断 · ${periodDays} 天行动后`, summary: advancedJava ? ['本轮准备闭环完成', 'Java 核心：gap → partial', 'Spring Boot：P1 → 当前主线'] : ['本轮准备闭环完成', 'Java 核心：仍需优先巩固', 'Spring Boot：继续等待基础练习'], reason: advancedJava ? '多线程已经入门并完成简单练习，但仍不熟练；当前可以开始框架学习，同时继续巩固基础。' : '本次反馈尚不能支持 Java 基础进入部分满足，继续优先练习。', selectedAction: '上一周期：补齐进入后端框架前的核心基础' }] : []),
    { id: 'formal', title: '第 1 次正式诊断 · 用户纠正后', summary: ['Java 核心：P0', 'MySQL：P0', 'Spring Boot：P1'], reason: '用户确认多线程尚未学习、MySQL 只会 CRUD，基础差距优先于框架。', selectedAction: selectedAction || '尚未选择行动' },
    { id: 'initial', title: '初始诊断', summary: ['Spring Boot 暂列优先', '判断依据中包含 AI 推测'], reason: '把“学过 Java 基础”偏乐观地推测为可以进入框架学习，后来被用户纠正。', selectedAction: '当时尚未选择行动' },
  ]
}
