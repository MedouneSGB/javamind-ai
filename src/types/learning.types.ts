export type UserLevel = 'beginner' | 'intermediate' | 'advanced'
export type ConceptStatus = 'locked' | 'available' | 'in-progress' | 'mastered'

export interface Concept {
  id: string
  title: string
  description: string
  prerequisite: string[]
  track: string
}

export interface LearningTrack {
  id: string
  title: string
  description: string
  concepts: Concept[]
}

export interface LearningPath {
  tracks: LearningTrack[]
}
