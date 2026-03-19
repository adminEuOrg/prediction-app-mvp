import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val.length > 0) env[key.trim()] = val.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const email = "test_form_user" + Math.floor(Math.random() * 1000) + "@test.com"
  const payload = {
    email,
    password: "password123",
    options: {
      data: {
        user_name: email.split('@')[0], 
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random().toString(36).substring(7)}`
      }
    }
  }

  console.log("Payload:", payload)
  const { data, error } = await supabase.auth.signUp(payload)
  if (error) {
    console.error("Signup failed:", error)
  } else {
    console.log("Signup succeeded:", data.user?.id)
  }
}

test()
