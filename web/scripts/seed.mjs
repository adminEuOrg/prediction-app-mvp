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

async function seed() {
  console.log('🌱 Starting Supabase Seeding...')
  
  const usersToCreate = [
    { email: 'alex@test.com', name: 'Alex' },
    { email: 'sarah@test.com', name: 'Sarah' },
    { email: 'mike@test.com', name: 'Mike' },
    { email: 'emma@test.com', name: 'Emma' },
    { email: 'david@test.com', name: 'David' }
  ]

  const createdUsers = []

  for (const u of usersToCreate) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: u.email,
      password: 'password123',
      options: {
        data: {
          user_name: u.name,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`
        }
      }
    })
    
    // sign in again to ensure session is active
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: 'password123'
    })
    
    if (sessionData && sessionData.user) {
      createdUsers.push(sessionData.user)
      console.log(`✅ User Ready: ${u.email}`)
      // Small delay to ensure DB triggers finish creating profiles
      await new Promise(r => setTimeout(r, 800));
    } else {
      console.error(`❌ Failed for ${u.email}:`, loginError?.message || signUpError?.message)
    }
  }

  if (createdUsers.length < 3) {
    console.log("Not enough users to seed predictions.")
    return;
  }

  const u1 = createdUsers[0]
  const u2 = createdUsers[1]
  const u3 = createdUsers[2]
  const u4 = createdUsers[3]
  const u5 = createdUsers[4]

  console.log('📝 Creating Predictions...')
  
  const d1 = new Date()
  d1.setDate(d1.getDate() + 3)
  const d2 = new Date()
  d2.setDate(d2.getDate() + 7)
  const d3 = new Date()
  d3.setDate(d3.getDate() + 30)

  // -- User 1 --
  await supabase.auth.signInWithPassword({ email: u1.email, password: 'password123' })
  const { data: p1, error: p1e } = await supabase.from('predictions').insert({
    author_id: u1.id,
    title: '挑战这个月跑量突破100公里！',
    reward: '达不到的话在群里发500块大红包',
    deadline: d1.toISOString(),
    status: 'active'
  }).select().single()

  const { data: p2, error: p2e } = await supabase.from('predictions').insert({
    author_id: u1.id,
    title: '一个月内拿下一个大厂的 Offer！',
    reward: '请所有投“能成”的朋友喝霸王茶姬',
    deadline: d3.toISOString(),
    status: 'active'
  }).select().single()

  // -- User 2 --
  await supabase.auth.signInWithPassword({ email: u2.email, password: 'password123' })
  const { data: p3, error: p3e } = await supabase.from('predictions').insert({
    author_id: u2.id,
    title: '断糖打卡30天，拒绝任何奶茶甜品！',
    reward: '群友共同瓜分我的 1000 先知积分',
    deadline: d3.toISOString(),
    status: 'active'
  }).select().single()

  // -- User 3 --
  await supabase.auth.signInWithPassword({ email: u3.email, password: 'password123' })
  const { data: p4, error: p4e } = await supabase.from('predictions').insert({
    author_id: u3.id,
    title: '这周末前搞定房间的大扫除和极简断舍离',
    reward: '把找出吃灰的 Switch 送给抽中的盖章铁粉',
    deadline: d2.toISOString(),
    status: 'active'
  }).select().single()

  if (p1e || p2e || p3e || p4e) {
    console.error('❌ Error creating predictions:', p1e, p2e, p3e, p4e)
  } else {
    console.log('✅ Created 4 Predictions')
  }

  console.log('🗳️ Adding Votes & Comments...')
  
  // -- Interactions User 2 --
  await supabase.auth.signInWithPassword({ email: u2.email, password: 'password123' })
  await supabase.from('votes').insert([{ prediction_id: p1.id, user_id: u2.id, vote_type: 'negative' }])
  await supabase.from('comments').insert([{ prediction_id: p1.id, user_id: u2.id, content: '100公里也太夸张了吧，小心膝盖废了！' }])
  await supabase.from('votes').insert([{ prediction_id: p4.id, user_id: u2.id, vote_type: 'positive' }])
  await supabase.from('comments').insert([{ prediction_id: p4.id, user_id: u2.id, content: '我要 Switch！支持！' }])

  // -- Interactions User 3 --
  await supabase.auth.signInWithPassword({ email: u3.email, password: 'password123' })
  await supabase.from('votes').insert([{ prediction_id: p1.id, user_id: u3.id, vote_type: 'positive' }])
  await supabase.from('comments').insert([{ prediction_id: p1.id, user_id: u3.id, content: '支持一波，大佬加油搞起！' }])
  await supabase.from('votes').insert([{ prediction_id: p3.id, user_id: u3.id, vote_type: 'negative' }])

  // -- Interactions User 4 --
  await supabase.auth.signInWithPassword({ email: u4.email, password: 'password123' })
  await supabase.from('votes').insert([{ prediction_id: p1.id, user_id: u4.id, vote_type: 'positive' }])
  await supabase.from('votes').insert([{ prediction_id: p2.id, user_id: u4.id, vote_type: 'positive' }])
  await supabase.from('votes').insert([{ prediction_id: p3.id, user_id: u4.id, vote_type: 'negative' }])
  await supabase.from('comments').insert([{ prediction_id: p2.id, user_id: u4.id, content: '这个月环境不好，祝你好运！' }])

  // -- Interactions User 5 --
  await supabase.auth.signInWithPassword({ email: u5.email, password: 'password123' })
  await supabase.from('votes').insert([{ prediction_id: p1.id, user_id: u5.id, vote_type: 'negative' }])
  await supabase.from('votes').insert([{ prediction_id: p4.id, user_id: u5.id, vote_type: 'negative' }])
  await supabase.from('comments').insert([{ prediction_id: p4.id, user_id: u5.id, content: '必不可能大扫除哈哈哈哈我太懂你了' }])

  console.log('🎉 Seeding Complete! Enjoy your rich Mock Data.')
}

seed()
