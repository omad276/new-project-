-- HormuzRoute Database Schema
-- Phase 5: Production SaaS with Supabase

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Tracks Stripe subscriptions
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USAGE TABLE
-- Tracks analysis usage per user
-- ============================================
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  analysis_count INTEGER DEFAULT 0,
  monthly_analysis_count INTEGER DEFAULT 0,
  last_analysis_at TIMESTAMPTZ,
  month_reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYSIS HISTORY TABLE
-- Stores route analysis history
-- ============================================
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input JSONB NOT NULL,
  results JSONB NOT NULL,
  ai_analysis TEXT,
  top_route_name TEXT,
  top_route_cost DECIMAL(12, 2),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions: Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Usage: Users can read their own usage
CREATE POLICY "Users can read own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- Analysis History: Users can CRUD their own history
CREATE POLICY "Users can read own history"
  ON analysis_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON analysis_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON analysis_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE POLICIES
-- For Stripe webhooks and admin operations
-- ============================================
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage usage"
  ON usage FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NEW USER TRIGGER
-- Creates profile and usage records on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );

  INSERT INTO usage (user_id, analysis_count, monthly_analysis_count)
  VALUES (NEW.id, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- USAGE HELPER FUNCTIONS
-- ============================================

-- Check if user can perform analysis (server-side enforcement)
CREATE OR REPLACE FUNCTION can_analyze(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_monthly_count INTEGER;
  v_subscription_status TEXT;
BEGIN
  -- Get user's plan
  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;

  -- Pro/Enterprise users have unlimited
  IF v_plan IN ('pro', 'enterprise') THEN
    -- Verify they have an active subscription
    SELECT status INTO v_subscription_status
    FROM subscriptions
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_subscription_status = 'active' THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Free users: check monthly limit (10 analyses)
  SELECT monthly_analysis_count INTO v_monthly_count
  FROM usage
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_monthly_count, 0) < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment analysis count
CREATE OR REPLACE FUNCTION increment_analysis(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Reset monthly count if new month
  UPDATE usage
  SET
    monthly_analysis_count = CASE
      WHEN DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', month_reset_at) THEN 1
      ELSE monthly_analysis_count + 1
    END,
    analysis_count = analysis_count + 1,
    last_analysis_at = NOW(),
    month_reset_at = CASE
      WHEN DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', month_reset_at) THEN DATE_TRUNC('month', NOW())
      ELSE month_reset_at
    END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get usage stats for user
CREATE OR REPLACE FUNCTION get_usage_stats(p_user_id UUID)
RETURNS TABLE (
  plan TEXT,
  analysis_count INTEGER,
  monthly_analysis_count INTEGER,
  monthly_limit INTEGER,
  can_analyze BOOLEAN,
  subscription_status TEXT,
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.plan,
    u.analysis_count,
    u.monthly_analysis_count,
    CASE p.plan
      WHEN 'free' THEN 10
      ELSE -1  -- unlimited
    END AS monthly_limit,
    can_analyze(p_user_id) AS can_analyze,
    COALESCE(s.status, 'none') AS subscription_status,
    s.current_period_end
  FROM profiles p
  LEFT JOIN usage u ON u.user_id = p.id
  LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
