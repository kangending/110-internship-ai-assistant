import { ArrowLeft } from 'lucide-react'
import type { Route } from './useHashRoute'
import { navigate, type Assessment } from '../state/useAssessment'

export function FlowBackButton({ route, assessment }: { route: Route; assessment: Assessment }) {
  const back = route === 'create' ? () => navigate('home')
    : route === 'understanding' ? assessment.backToForm
    : route === 'diagnosis' && assessment.diagnosisOrigin === 'understanding' ? assessment.returnToUnderstanding
    : route === 'proposal' ? () => navigate('diagnosis')
    : route === 'action' && assessment.actionOrigin === 'proposal' ? () => navigate('proposal')
    : route === 'feedback' ? () => navigate('action')
    : null
  if (!back) return null
  return <button type="button" className="flow-back-button" onClick={back}>
    <ArrowLeft size={16} aria-hidden="true" /> {route === 'action' ? '查看行动方案' : '返回上一步'}
  </button>
}
