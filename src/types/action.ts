import type { ConfirmedInformation, DiagnosisSnapshot } from './case'

export interface ActionTask {
  id: 'threads' | 'mysql' | 'algorithms'
  title: string
  goal: string
  criteria: string[]
}

export interface ActionPlan {
  id: string
  gapId: string
  title: string
  mode: 'executable' | 'direction'
  /** A direction has no rules for turning feedback into confirmed facts. */
  feedbackKind: 'lin_hao_java_core' | null
  days: 7 | 10
  algorithmTarget: number
  removedTaskId: ActionTask['id'] | null
  tasks: ActionTask[]
}

export interface ActionProgress { algorithmCompleted: number }
export type ActionPeriod = 'active' | 'ended'

export interface ActionFeedback {
  threads: 'not_started' | 'watched' | 'practiced' | 'independent'
  threadsNote: string
  mysql: 'not_started' | 'intro' | 'explained'
  mysqlNote: string
  algorithmCompleted: number
  algorithmIndependent: number
  difficulty: 'slow' | 'time' | 'cannot_code' | 'too_many' | 'other'
}

export interface DiagnosisHistoryEntry {
  id: string
  title: string
  summary: string[]
  reason: string
  selectedAction: string
}

export interface ActionOutcome {
  facts: ConfirmedInformation[]
  diagnosis: DiagnosisSnapshot
}
