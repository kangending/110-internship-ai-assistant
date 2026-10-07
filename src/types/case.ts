/** All people, experiences, job requirements and behavior in a MockCase are fictional. */
export type InformationSource =
  | 'user_input'
  | 'jd'
  | 'ai_inference'
  | 'generic_role_assumption'
  | 'user_correction'
  | 'user_supplement'
  | 'user_confirmation'
  | 'action_feedback'

export type InformationStatus = 'confirmed' | 'inferred' | 'unknown'
export type GapStatus = 'met' | 'partial' | 'gap' | 'unknown'
export type Priority = 'P0' | 'P1' | 'P2'

export interface UserProfile {
  name: string
  grade: string
  major: string
  schoolBackground?: string // Background only; never used for gap or priority decisions.
}

export interface JobRequirement {
  id: string
  text: string
  source: 'jd' | 'generic_role_assumption'
}

export interface TargetJd {
  source: 'jd'
  requirements: JobRequirement[]
}

export interface TargetJob {
  title: string
  /** null means no user-provided JD; generic requirements must retain their own source. */
  jd: TargetJd | null
}

export interface InitialInput {
  profile: UserProfile
  targetJob: TargetJob
  monthsUntilApplications: number
  hoursPerWeek: number
  experienceDescription: string
  /** Explicit first-input facts; a broad claim must not be strengthened by AI. */
  statedFacts: ConfirmedInformation[]
}

interface InformationBase {
  id: string
  topic: string
  statement: string
}

export interface ConfirmedInformation extends InformationBase {
  status: 'confirmed'
  source: 'user_input' | 'jd' | 'user_correction' | 'user_supplement' | 'user_confirmation' | 'action_feedback'
}

export interface InferredInformation extends InformationBase {
  status: 'inferred'
  source: 'ai_inference' | 'generic_role_assumption'
  basedOnInformationIds: string[]
}

export interface UnknownInformation extends InformationBase {
  status: 'unknown'
  /** No source: absence of evidence is neither a user statement nor an AI fact. */
  source: null
}

export type Information = ConfirmedInformation | InferredInformation | UnknownInformation

export interface UnderstandingSnapshot {
  confirmed: ConfirmedInformation[]
  inferred: InferredInformation[]
  unknown: UnknownInformation[]
}

export interface MissingInformation {
  informationId: string
  affectsTopThree: boolean
  reason: string
}

export interface SupplementQuestion {
  id: string
  missingInformationId: string
  text: string
}

export type InformationChoice = 'supplement_first' | 'view_preliminary'

export interface PriorityBasis {
  explicitInJd: boolean
  confirmedGap: boolean
  prerequisiteForLaterAbility: boolean
  prerequisiteFor?: string[]
  monthsUntilApplications: number
}

export interface DiagnosisRecommendation {
  id: string
  rank: number
  title: string
  gapStatus: GapStatus
  priority: Priority
  requirementIds: string[]
  informationIds: string[]
  basis: PriorityBasis
  reasons: string[]
}

export interface DiagnosisSnapshot {
  id: string
  kind: 'preliminary' | 'revised' | 'post_action'
  /** Preliminary if key facts remain unconfirmed or only generic role requirements are available. */
  preliminary: boolean
  /** JD requirements when supplied; otherwise explicitly tagged generic assumptions. */
  requirements: JobRequirement[]
  missingInformation: MissingInformation[]
  supplementQuestions: SupplementQuestion[]
  /** Present for a preliminary diagnosis shown before the user answers. */
  informationChoice?: InformationChoice
  recommendations: DiagnosisRecommendation[]
  replacesDiagnosisId?: string
}

export interface UserCorrection {
  id: string
  status: 'confirmed'
  source: 'user_correction'
  topic: string
  statement: string
  /** Explicit relation to older AI guesses; corrected facts take precedence. */
  supersedesInformationIds: string[]
}

export interface RecommendationChange {
  previousRecommendationId: string | null
  revisedRecommendationId: string | null
  explanation: string
  correctionIds: string[]
}

export interface MockCase {
  disclaimer: string
  initialInput: InitialInput
  firstUnderstanding: UnderstandingSnapshot
  firstDiagnosis: DiagnosisSnapshot
  corrections: UserCorrection[]
  /** Effective state after corrections; superseded inferences are omitted. */
  correctedUnderstanding: UnderstandingSnapshot
  revisedDiagnosis: DiagnosisSnapshot
  recommendationChanges: RecommendationChange[]
  followUp: string
}
