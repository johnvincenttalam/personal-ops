import type { ProjectColor } from '@/types'

export const colorDot: Record<ProjectColor, string> = {
  violet: 'bg-violet-500',
  orange: 'bg-orange-500',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
  pink: 'bg-pink-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
}

export const colorSwatch: Record<ProjectColor, string> = {
  violet: 'bg-violet-500 hover:bg-violet-600',
  orange: 'bg-orange-500 hover:bg-orange-600',
  green: 'bg-emerald-500 hover:bg-emerald-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  pink: 'bg-pink-500 hover:bg-pink-600',
  red: 'bg-red-500 hover:bg-red-600',
  gray: 'bg-gray-400 hover:bg-gray-500',
}

export const COLOR_OPTIONS: ProjectColor[] = ['violet', 'orange', 'green', 'blue', 'pink', 'red', 'gray']
