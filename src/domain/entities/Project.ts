export type ProjectColor =
  | 'violet'
  | 'orange'
  | 'green'
  | 'blue'
  | 'pink'
  | 'red'
  | 'gray'

export interface Project {
  id: string
  user_id: string | null
  name: string
  color: ProjectColor
  description: string
  tags: string[]
  position: number
  created_at: string
  updated_at: string
}
