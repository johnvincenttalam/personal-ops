import { supabase, LOCAL_USER_ID } from '@/services/supabaseClient'
import { SupabaseNoteRepository } from './supabase/SupabaseNoteRepository'
import { SupabasePromptRepository } from './supabase/SupabasePromptRepository'
import { SupabaseStorageRepository } from './supabase/SupabaseStorageRepository'
import { SupabaseProjectRepository } from './supabase/SupabaseProjectRepository'
import { SupabaseChecklistRepository } from './supabase/SupabaseChecklistRepository'
import { SupabaseSearchGateway } from './supabase/SupabaseSearchGateway'
import { createNoteService } from '@/application/services/NoteService'
import { createPromptService } from '@/application/services/PromptService'
import { createStorageService } from '@/application/services/StorageService'
import { createProjectService } from '@/application/services/ProjectService'
import { createChecklistService } from '@/application/services/ChecklistService'
import { createSearchService } from '@/application/services/SearchService'

/**
 * Composition root — the single place where infrastructure adapters are wired
 * to application services. Stores import `services` from here; nothing else
 * should reach into infrastructure or instantiate repositories directly.
 */

const noteRepo      = new SupabaseNoteRepository(supabase)
const promptRepo    = new SupabasePromptRepository(supabase)
const storageRepo   = new SupabaseStorageRepository(supabase)
const projectRepo   = new SupabaseProjectRepository(supabase)
const checklistRepo = new SupabaseChecklistRepository(supabase)
const searchGateway = new SupabaseSearchGateway(supabase)

export const services = {
  notes:      createNoteService     ({ repo: noteRepo,      userId: LOCAL_USER_ID }),
  prompts:    createPromptService   ({ repo: promptRepo,    userId: LOCAL_USER_ID }),
  storage:    createStorageService  ({ repo: storageRepo,   userId: LOCAL_USER_ID }),
  projects:   createProjectService  ({ repo: projectRepo,   userId: LOCAL_USER_ID }),
  checklists: createChecklistService({ repo: checklistRepo, userId: LOCAL_USER_ID }),
  search:     createSearchService   ({ gateway: searchGateway }),
} as const
