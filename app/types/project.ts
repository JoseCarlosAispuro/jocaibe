export interface ProjectAward {
  tier: string
  label: string
}

export interface Project {
  id: string
  title: string
  subtitle: string
  year: string
  role: string
  award: ProjectAward | null
  url: string
  stack: string[]
  tags: string[]
  impact: [string, string][]
  summary: string
  bg: string
  accentText: string
  cover?: string
  shots?: string[]
  dark?: boolean
}
