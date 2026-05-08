import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns'

export function relativeLabel(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function fullDate(iso: string): string {
  return format(new Date(iso), "MMMM d, yyyy 'at' h:mm a")
}
