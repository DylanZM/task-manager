# InsForge Kanban Task Manager

Kanban-style task manager built with Next.js and InsForge, including:

- User registration
- Login/logout
- Email verification-aware sign-up flow (code/link backend config)
- Board-based Kanban workflow (create board, then manage tasks per board)
- Task CRUD (create, edit, move between columns, delete)
- AI task description generation from task title
- Persistent tasks in InsForge Postgres with RLS per user

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your InsForge values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `NEXT_PUBLIC_INSFORGE_AI_MODEL` (optional, recommended to pin a specific active AI model ID)

## 3. Configure backend schema + RLS

Apply the SQL in `insforge/schema.sql` to your InsForge database.

Example:

```bash
npx @insforge/cli db query "$(cat insforge/schema.sql)"
```

This creates:

- `boards` table (per-user Kanban boards)
- `tasks` table
- `profiles` table linked to `auth.users`
- indexes for Kanban querying
- row-level security policies tied to `auth.uid()` (forced RLS)
- explicit grants so `anon` has no access and `authenticated` has scoped CRUD
- `updated_at` trigger using a local `plpgsql` trigger function

## 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Auth UI reads InsForge public auth config from `/api/auth/public-config` to align with backend settings.
- Task description AI generation uses `insforge.ai.chat.completions.create` and reads active models from `ai.configs` when `NEXT_PUBLIC_INSFORGE_AI_MODEL` is not set.
- If verification method is `code`, users can verify directly in the app.
- If verification method is `link`, users receive a verification link and then sign in.
- Current backend auth metadata: email verification required, verify method `code`, reset method `code`, OAuth providers: GitHub and Google.
