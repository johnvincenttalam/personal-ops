import type { SupabaseClient } from '@supabase/supabase-js'

interface OrderClause {
  column: string
  ascending: boolean
}

/**
 * Shared CRUD plumbing for Supabase-backed repositories. Handles the
 * patterns that every entity repeats: parameterized list, single insert,
 * patch-based update (skipping no-op patches), and delete-by-id.
 *
 * Subclasses provide:
 *   - the table name (via constructor)
 *   - any entity-specific list filters / extra methods (createMany, etc.)
 */
export abstract class BaseSupabaseRepository<T> {
  constructor(
    protected readonly db: SupabaseClient,
    protected readonly table: string,
  ) {}

  /**
   * Generic "select * from <table> where <filters> order by <order>".
   * `null` values in `filters` are translated to `is null`.
   */
  protected async listOrderedBy(
    filters: Record<string, unknown>,
    order: OrderClause[],
  ): Promise<T[]> {
    let q = this.db.from(this.table).select('*')
    for (const [col, val] of Object.entries(filters)) {
      q = val === null ? q.is(col, null) : q.eq(col, val)
    }
    for (const o of order) {
      q = q.order(o.column, { ascending: o.ascending })
    }
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as T[]
  }

  /** Insert a single row and return the persisted entity. */
  protected async insertOne(values: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.db
      .from(this.table)
      .insert(values)
      .select()
      .single()
    if (error || !data) throw error ?? new Error('insert returned no row')
    return data as T
  }

  /** Insert multiple rows and return all persisted entities. */
  protected async insertMany(values: Record<string, unknown>[]): Promise<T[]> {
    if (values.length === 0) return []
    const { data, error } = await this.db
      .from(this.table)
      .insert(values)
      .select()
    if (error) throw error
    return (data ?? []) as T[]
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    if (Object.keys(patch as object).length === 0) return
    const { error } = await this.db.from(this.table).update(patch as object).eq('id', id)
    if (error) throw error
  }

  /** Bulk update by id list. Used by checklist `moveList`. */
  protected async updateManyById(ids: string[], patch: Partial<T>): Promise<void> {
    if (ids.length === 0 || Object.keys(patch as object).length === 0) return
    const { error } = await this.db.from(this.table).update(patch as object).in('id', ids)
    if (error) throw error
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from(this.table).delete().eq('id', id)
    if (error) throw error
  }
}
