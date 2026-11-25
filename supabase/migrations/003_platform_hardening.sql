-- ============================================================================
-- UnlockED Hardening & Real-Time Migration (003_platform_hardening.sql)
-- Adds automatic profile signup trigger, account status governance, audit logs,
-- tightened RLS, and Realtime publication enrollment.
-- ============================================================================

-- 1. Account suspension & user preferences on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended')),
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL
    DEFAULT '{"email_updates": true, "job_alerts": true, "course_reminders": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB NOT NULL
    DEFAULT '{"public_portfolio": true, "show_email_to_recruiters": false}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- 2. Audit logs table for administrative and security governance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins insert audit logs" ON audit_logs;
CREATE POLICY "Admins insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 3. Automatic profile provisioning trigger on Supabase Auth signup
--    Strictly prevents privilege escalation: public signups can NEVER request 'admin'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  req_role TEXT;
  assigned_role user_role;
  full_name_val TEXT;
BEGIN
  req_role := COALESCE(NEW.raw_user_meta_data->>'requested_role', 'student');
  IF req_role = 'recruiter' THEN
    assigned_role := 'recruiter'::user_role;
  ELSE
    assigned_role := 'student'::user_role;
  END IF;

  full_name_val := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, email, full_name, role, onboarding_completed)
  VALUES (NEW.id, NEW.email, full_name_val, assigned_role, false)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Tighten certificate & assessment RLS so clients cannot bypass server verification
DROP POLICY IF EXISTS "System/Admins issue certificates" ON certificates;
CREATE POLICY "Admins only issue certificates directly"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Prevent regular users from self-elevating profiles.role via client UPDATE
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile safely"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM profiles p WHERE p.id = auth.uid())
  );

-- Prevent unverified client direct reads of assessment answer keys
DROP POLICY IF EXISTS "Assessments viewable by authenticated users" ON assessments;
CREATE POLICY "Only admins read full assessment rows directly"
  ON assessments FOR SELECT
  TO authenticated
  USING (is_admin());

-- 5. Enable Supabase Realtime replication for live cross-role workflows
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'notifications',
    'applications',
    'jobs',
    'enrollments',
    'lesson_progress',
    'assessment_attempts',
    'certificates',
    'profiles'
  ])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END $$;
