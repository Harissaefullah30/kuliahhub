import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yazpcyiqxccsellgonwe.supabase.co'
const supabaseAnonKey = 'sb_publishable_DaGMGLVd8BskgyD-UVFVRA_zAqnIyLV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)