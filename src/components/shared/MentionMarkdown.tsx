import { useMemo } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { transformMentionsForPreview } from '@/domain/rules/parseMentions'
import { useMentionRouter } from '@/hooks/useMentionRouter'

interface Props {
  source: string
  className?: string
}

/**
 * Markdown renderer that turns @[Title](type:id) mentions into clickable pills.
 * Click handler routes to the referenced item (project + tab + active id).
 */
export default function MentionMarkdown({ source, className }: Props) {
  const route = useMentionRouter()
  const transformed = useMemo(() => transformMentionsForPreview(source), [source])

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null
    if (!target) return
    const href = target.getAttribute('href') || ''
    if (!href.startsWith('mention:')) return
    e.preventDefault()
    route(href)
  }

  return (
    <div onClick={onClick}>
      <MDEditor.Markdown source={transformed} className={className} />
    </div>
  )
}
