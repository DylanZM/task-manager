# InsForge Kanban Task Manager

Kanban-style task manager built with Next.js and InsForge, including:

- User registration
- Login/logout
- Email verification-aware sign-up flow (code/link backend config)
- Board-based Kanban workflow (create board, then manage tasks per board)
- Task CRUD (create, edit, move between columns, delete)
- Drag & drop de tareas entre estados del Kanban
- AI task description generation from task title
- Real-time task synchronization by board (status and changes across open clients)
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

> Use real InsForge project values; placeholder values (for example `your-project.insforge.app`) will fail auth/network requests.

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

Rutas principales:

- `http://localhost:3000/login` para autenticación
- `http://localhost:3000/register` para registro
- `http://localhost:3000/` para el board Kanban autenticado

## Notes

- Auth UI reads InsForge public auth config from `/api/auth/public-config` to align with backend settings.
- Task description AI generation uses `insforge.ai.chat.completions.create` with **GPT-5 mini** (`NEXT_PUBLIC_INSFORGE_AI_MODEL` if it points to GPT-5 mini, otherwise fallback to `openai/gpt-5-mini`).
- Real-time sync uses InsForge channels (`board:%`) plus DB trigger publish via `realtime.publish` from `tasks` changes.
- If verification method is `code`, users can verify directly in the app.
- If verification method is `link`, users receive a verification link and then sign in.
- Current backend auth metadata: email verification required, verify method `code`, reset method `code`, OAuth providers: GitHub and Google.
