-- ==========================================
-- PREDICTION APP MVP - SUPABASE SCHEMA
-- ==========================================

-- 1. PROFILES TABLE (Extends Auth Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  prophet_points INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. PREDICTIONS TABLE (The Core "Flag" / "Bet")
CREATE TYPE prediction_status AS ENUM ('active', 'verifying', 'resolved', 'appealed');
CREATE TYPE prediction_result AS ENUM ('positive', 'negative');

CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  reward TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status prediction_status DEFAULT 'active' NOT NULL,
  
  -- Result fields
  proof_image_url TEXT,
  ai_verdict prediction_result,
  final_result prediction_result,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 3. VOTES TABLE (The Stamping Interaction)
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type prediction_result NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(prediction_id, user_id) -- One vote per user per prediction
);


-- 4. COMMENTS TABLE (The Chat / Teasing)
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, user can update their own
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Predictions: Anyone can read, authenticated can insert, author can update (e.g., upload proof)
CREATE POLICY "Predictions are readable by everyone" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own predictions" ON public.predictions FOR UPDATE USING (auth.uid() = author_id);

-- Votes: Anyone can read, authenticated can insert/update/delete their own
CREATE POLICY "Votes are readable by everyone" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own vote" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vote" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vote" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Anyone can read, authenticated can insert, owner can delete
CREATE POLICY "Comments are readable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- HELPER VIEWS for Frontend UI
-- ==========================================
-- Aggregates vote counts efficiently so frontend doesn't need to join massively
CREATE OR VIEW public.vw_prediction_stats AS
SELECT 
  p.id as prediction_id,
  COUNT(v.id) as total_votes,
  COUNT(CASE WHEN v.vote_type = 'positive' THEN 1 END) as positive_votes,
  COUNT(CASE WHEN v.vote_type = 'negative' THEN 1 END) as negative_votes
FROM public.predictions p
LEFT JOIN public.votes v ON p.id = v.prediction_id
GROUP BY p.id;
