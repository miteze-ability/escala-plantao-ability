import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cliente público (leitura) — seguro para usar no browser
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Cliente com service_role (escrita/admin) — usar APENAS em Server Components / API Routes
export function supabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}
