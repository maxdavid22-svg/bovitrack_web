import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE as string;

if (!url) {
  throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL');
}
if (!serviceRoleKey) {
  // No tiramos error duro para permitir build, pero el endpoint fallará con 500
  console.warn('ADVERTENCIA: Falta SUPABASE_SERVICE_ROLE');
}

export const supabaseAdmin = createClient(url, serviceRoleKey || '');


