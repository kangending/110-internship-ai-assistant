export interface MockCase {
  name: string
  grade: string
  major: string
  targetRole: string
  monthsUntilApplications: number
  hoursPerWeek: number
  initialDescription: string
  initialAiMisunderstanding: string
  userCorrection: string
  correctedPriorities: string[]
  followUp: string
}
