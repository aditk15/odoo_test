-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('upvote', 'downvote', 'answer', 'comment', 'mention')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get vote counts
CREATE OR REPLACE FUNCTION get_question_vote_counts(question_ids UUID[])
RETURNS TABLE(
  question_id UUID,
  upvotes INTEGER,
  downvotes INTEGER,
  user_vote TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    COALESCE(upvote_counts.count, 0)::INTEGER as upvotes,
    COALESCE(downvote_counts.count, 0)::INTEGER as downvotes,
    user_votes.vote_type as user_vote
  FROM 
    (SELECT unnest(question_ids) as id) q
  LEFT JOIN (
    SELECT question_id, COUNT(*) as count
    FROM public.votes 
    WHERE vote_type = 'up' AND question_id = ANY(question_ids)
    GROUP BY question_id
  ) upvote_counts ON q.id = upvote_counts.question_id
  LEFT JOIN (
    SELECT question_id, COUNT(*) as count
    FROM public.votes 
    WHERE vote_type = 'down' AND question_id = ANY(question_ids)
    GROUP BY question_id
  ) downvote_counts ON q.id = downvote_counts.question_id
  LEFT JOIN (
    SELECT question_id, vote_type
    FROM public.votes 
    WHERE user_id = auth.uid() AND question_id = ANY(question_ids)
  ) user_votes ON q.id = user_votes.question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ Corrected: Function to handle voting (reordered parameters)
CREATE OR REPLACE FUNCTION handle_vote(
  target_question_id UUID,
  new_vote_type TEXT,
  target_answer_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  existing_vote RECORD;
  question_author_id UUID;
  answer_author_id UUID;
  notification_title TEXT;
  notification_message TEXT;
  target_author_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate vote type
  IF new_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote type. Must be up or down';
  END IF;

  -- Get existing vote
  IF target_answer_id IS NOT NULL THEN
    SELECT * INTO existing_vote 
    FROM public.votes 
    WHERE user_id = current_user_id AND answer_id = target_answer_id;
    
    -- Get answer author for notifications
    SELECT author_id INTO answer_author_id 
    FROM public.answers 
    WHERE id = target_answer_id;
    target_author_id := answer_author_id;
  ELSE
    SELECT * INTO existing_vote 
    FROM public.votes 
    WHERE user_id = current_user_id AND question_id = target_question_id;
    
    -- Get question author for notifications
    SELECT author_id INTO question_author_id 
    FROM public.questions 
    WHERE id = target_question_id;
    target_author_id := question_author_id;
  END IF;

  -- Handle vote logic
  IF existing_vote IS NOT NULL THEN
    IF existing_vote.vote_type = new_vote_type THEN
      -- Remove vote (toggle off)
      DELETE FROM public.votes WHERE id = existing_vote.id;
      RETURN json_build_object('action', 'removed', 'vote_type', new_vote_type);
    ELSE
      -- Update vote type
      UPDATE public.votes 
      SET vote_type = new_vote_type, created_at = NOW()
      WHERE id = existing_vote.id;
    END IF;
  ELSE
    -- Insert new vote
    IF target_answer_id IS NOT NULL THEN
      INSERT INTO public.votes (user_id, answer_id, vote_type)
      VALUES (current_user_id, target_answer_id, new_vote_type);
    ELSE
      INSERT INTO public.votes (user_id, question_id, vote_type)
      VALUES (current_user_id, target_question_id, new_vote_type);
    END IF;
  END IF;

  -- Create notification (only for upvotes and not on own content)
  IF new_vote_type = 'up' AND target_author_id != current_user_id AND target_author_id IS NOT NULL THEN
    IF target_answer_id IS NOT NULL THEN
      notification_title := 'Your answer received an upvote!';
      notification_message := 'Someone upvoted your answer.';
    ELSE
      notification_title := 'Your question received an upvote!';
      notification_message := 'Someone upvoted your question.';
    END IF;

    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      question_id, 
      answer_id, 
      triggered_by
    ) VALUES (
      target_author_id,
      'upvote',
      notification_title,
      notification_message,
      target_question_id,
      target_answer_id,
      current_user_id
    );
  END IF;

  RETURN json_build_object('action', 'updated', 'vote_type', new_vote_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create answer notifications
CREATE OR REPLACE FUNCTION create_answer_notification()
RETURNS TRIGGER AS $$
DECLARE
  question_author_id UUID;
  answerer_profile RECORD;
BEGIN
  SELECT author_id INTO question_author_id 
  FROM public.questions 
  WHERE id = NEW.question_id;

  SELECT username, email INTO answerer_profile
  FROM public.profiles
  WHERE id = NEW.author_id;

  IF question_author_id != NEW.author_id AND question_author_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      question_id,
      answer_id,
      triggered_by,
      data
    ) VALUES (
      question_author_id,
      'answer',
      'New answer to your question!',
      COALESCE(answerer_profile.username, answerer_profile.email, 'Someone') || ' answered your question.',
      NEW.question_id,
      NEW.id,
      NEW.author_id,
      json_build_object('answerer_name', COALESCE(answerer_profile.username, answerer_profile.email))
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire notification on new answer
DROP TRIGGER IF EXISTS answer_notification_trigger ON public.answers;
CREATE TRIGGER answer_notification_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION create_answer_notification();

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_votes_question_type ON public.votes(question_id, vote_type);
CREATE INDEX IF NOT EXISTS idx_votes_answer_type ON public.votes(answer_id, vote_type);
