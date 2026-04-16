CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_id UUID,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS board_id UUID;

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS boards_user_id_idx ON boards (user_id);
CREATE INDEX IF NOT EXISTS boards_user_name_idx ON boards (user_id, name);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_board_status_position_idx ON tasks (board_id, status, position);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_board_id_fkey'
      AND conrelid = 'tasks'::regclass
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_board_id_fkey
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;
  END IF;
END;
$$;

INSERT INTO boards (user_id, name)
SELECT DISTINCT t.user_id, 'Main Board'
FROM tasks t
WHERE NOT EXISTS (
  SELECT 1 FROM boards b WHERE b.user_id = t.user_id
);

WITH first_boards AS (
  SELECT DISTINCT ON (user_id) user_id, id
  FROM boards
  ORDER BY user_id, created_at
)
UPDATE tasks t
SET board_id = fb.id
FROM first_boards fb
WHERE t.board_id IS NULL
  AND t.user_id = fb.user_id;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tasks WHERE board_id IS NULL) THEN
    ALTER TABLE tasks ALTER COLUMN board_id SET NOT NULL;
  END IF;
END;
$$;

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards FORCE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boards_select_own" ON boards;
DROP POLICY IF EXISTS "boards_insert_own" ON boards;
DROP POLICY IF EXISTS "boards_update_own" ON boards;
DROP POLICY IF EXISTS "boards_delete_own" ON boards;

CREATE POLICY "boards_select_own"
ON boards FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "boards_insert_own"
ON boards FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "boards_update_own"
ON boards FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "boards_delete_own"
ON boards FOR DELETE
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tasks_select_own" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_own" ON tasks;
DROP POLICY IF EXISTS "tasks_update_own" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_own" ON tasks;

CREATE POLICY "tasks_select_own"
ON tasks FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = tasks.board_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "tasks_insert_own"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = tasks.board_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "tasks_update_own"
ON tasks FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = tasks.board_id
      AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = tasks.board_id
      AND b.user_id = auth.uid()
  )
);

CREATE POLICY "tasks_delete_own"
ON tasks FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM boards b
    WHERE b.id = tasks.board_id
      AND b.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_delete_own"
ON profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION boards_set_updated_at_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tasks_set_updated_at_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION profiles_set_updated_at_fn()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS boards_set_updated_at ON boards;
CREATE TRIGGER boards_set_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION boards_set_updated_at_fn();

DROP TRIGGER IF EXISTS tasks_set_updated_at ON tasks;
CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION tasks_set_updated_at_fn();

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION profiles_set_updated_at_fn();

REVOKE ALL ON TABLE boards FROM anon;
REVOKE ALL ON TABLE tasks FROM anon;
REVOKE ALL ON TABLE profiles FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE boards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
