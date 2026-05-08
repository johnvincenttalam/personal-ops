import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key || url.includes('YOUR-PROJECT')) {
  throw new Error(
    'Supabase env vars missing. Edit .env at the project root and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (Project Settings → API in Supabase). Then restart `npm run dev`.'
  )
}

export const supabase = createClient(url, key)

export const LOCAL_USER_ID =
  import.meta.env.VITE_LOCAL_USER_ID ?? '00000000-0000-0000-0000-000000000001'
