-- ==========================================
-- SETTLEMENT LOGIC & PROPHET POINTS REWARD
-- ==========================================

CREATE OR REPLACE FUNCTION public.resolve_prediction(p_id UUID, p_result prediction_result)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_author_id UUID;
  v_status prediction_status;
BEGIN
  -- 1. Get prediction author and status
  SELECT author_id, status INTO v_author_id, v_status
  FROM public.predictions
  WHERE id = p_id;

  -- 2. Verify authorization
  IF v_author_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized: Only the author can resolve this prediction.';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Prediction is already resolved or in a different state.';
  END IF;

  -- 3. Update prediction status
  UPDATE public.predictions
  SET status = 'resolved', final_result = p_result
  WHERE id = p_id;

  -- 4. Reward voters who guessed correctly
  -- Every correct guess gets +50 Prophet Points
  UPDATE public.profiles
  SET prophet_points = prophet_points + 50
  WHERE id IN (
    SELECT user_id FROM public.votes 
    WHERE prediction_id = p_id AND vote_type = p_result
  );

  -- 5. If author won (positive result), reward them!
  -- Overcoming a challenge grants +100 Prophet Points
  IF p_result = 'positive' THEN
    UPDATE public.profiles
    SET prophet_points = prophet_points + 100
    WHERE id = v_author_id;
  END IF;

  -- (Note: Complex recalculations for global win_rate are deferred for future scaling)
END;
$$;
