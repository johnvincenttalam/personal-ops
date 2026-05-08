import type { SupabaseClient } from '@supabase/supabase-js'
import type { BacklinkRef, CorpusItem, SearchGateway } from '@/application/ports/SearchGateway'
import type { MentionType } from '@/domain/rules/parseMentions'
import { backlinkNeedle } from '@/domain/rules/parseMentions'

const TABLE: Record<MentionType, string> = {
  note: 'notes',
  prompt: 'prompts',
  checklist: 'checklist_items',
  storage: 'storage_items',
}

export class SupabaseSearchGateway implements SearchGateway {
  constructor(private readonly db: SupabaseClient) {}

  async getCorpus(): Promise<CorpusItem[]> {
    const [n, p, c, s] = await Promise.all([
      this.db.from('notes')
        .select('id,title,content,is_pinned,project_id')
        .order('updated_at', { ascending: false }).limit(100),
      this.db.from('prompts')
        .select('id,title,content,is_pinned,project_id')
        .order('updated_at', { ascending: false }).limit(100),
      this.db.from('checklist_items')
        .select('id,content,project_id')
        .is('parent_id', null)
        .order('updated_at', { ascending: false }).limit(100),
      this.db.from('storage_items')
        .select('id,name,description,content,project_id')
        .order('updated_at', { ascending: false }).limit(100),
    ])

    const out: CorpusItem[] = []
    for (const r of n.data ?? []) out.push({
      id: r.id, type: 'note', title: r.title || 'Untitled',
      hint: r.content?.slice(0, 80), is_pinned: r.is_pinned, project_id: r.project_id,
    })
    for (const r of p.data ?? []) out.push({
      id: r.id, type: 'prompt', title: r.title || 'Untitled',
      hint: r.content?.slice(0, 80), is_pinned: r.is_pinned, project_id: r.project_id,
    })
    for (const r of c.data ?? []) out.push({
      id: r.id, type: 'checklist', title: r.content || 'Untitled list',
      project_id: r.project_id,
    })
    for (const r of s.data ?? []) out.push({
      id: r.id, type: 'storage', title: r.name || 'Untitled snippet',
      hint: r.description || r.content?.slice(0, 80), project_id: r.project_id,
    })
    return out
  }

  async findBacklinksTo(itemId: string): Promise<BacklinkRef[]> {
    const pattern = `%${backlinkNeedle(itemId)}%`
    const [n, p, s] = await Promise.all([
      this.db.from('notes').select('id,title,content').like('content', pattern).limit(50),
      this.db.from('prompts').select('id,title,content').like('content', pattern).limit(50),
      this.db.from('storage_items').select('id,name,content').like('content', pattern).limit(50),
    ])
    const out: BacklinkRef[] = []
    for (const r of n.data ?? []) out.push({ id: r.id, type: 'note', title: r.title || 'Untitled' })
    for (const r of p.data ?? []) out.push({ id: r.id, type: 'prompt', title: r.title || 'Untitled' })
    for (const r of s.data ?? []) out.push({ id: r.id, type: 'storage', title: r.name || 'Untitled' })
    return out
  }

  async getProjectId(type: MentionType, id: string): Promise<string | null> {
    const { data, error } = await this.db
      .from(TABLE[type])
      .select('project_id')
      .eq('id', id)
      .maybeSingle()
    if (error || !data) return null
    return (data as { project_id: string | null }).project_id
  }
}
