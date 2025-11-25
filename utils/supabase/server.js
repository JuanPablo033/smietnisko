import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerClient(req) {
  return createServerComponentClient({ cookies })
}