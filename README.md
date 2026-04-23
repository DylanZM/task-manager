# InsForge Kanban Task Manager

A modern Kanban task manager built with **Next.js 16**, **React 19**, and **InsForge**.

It includes authentication, multi-board organization, task CRUD, drag-and-drop status updates, AI-assisted task descriptions, and real-time synchronization.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup (Schema + RLS)](#database-setup-schema--rls)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Project Structure](#project-structure)
- [Security Model](#security-model)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)

## Features

- Email/password authentication with verification-aware flow (`code` or `link`)
- OAuth login support (GitHub and Google)
- Multi-board Kanban workflow (create, switch, and delete boards)
- Task management with title, description, status, priority, and due date
- Drag-and-drop movement across Kanban columns
- AI-generated task descriptions from task title
- Real-time updates per board across active clients
- Per-user data isolation with PostgreSQL Row-Level Security (RLS)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19 + Tailwind CSS 4
- **Backend Services:** InsForge (Auth, Postgres, Realtime, AI)
- **Linting:** ESLint

## Getting Started

### 1. Prerequisites

- Node.js 20+
- npm
- An InsForge project with auth and database enabled

### 2. Install dependencies

```bash
npm install
```

### 3. Create local environment file

Create `.env.local` in the project root:

```bash
touch .env.local
```

Then add:

```env
NEXT_PUBLIC_INSFORGE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key
NEXT_PUBLIC_INSFORGE_AI_MODEL=openai/gpt-5-mini
```

> `NEXT_PUBLIC_INSFORGE_AI_MODEL` is optional, but recommended to pin a known active model.

### 4. Apply database schema

Run the SQL in `insforge/schema.sql` in your InsForge project:

```bash
npx @insforge/cli db query "$(cat insforge/schema.sql)"
```

You can also run it manually from your database SQL editor.

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_INSFORGE_URL` | Yes | Base URL of your InsForge project |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Yes | Public anonymous key used by the frontend |
| `NEXT_PUBLIC_INSFORGE_AI_MODEL` | No | AI model ID used for description generation |
| `RESEND_API_KEY` | No* | Server key for due-date email notifications |
| `NOTIFICATION_FROM_EMAIL` | No* | Sender email used by Resend (for due-date reminders) |

\* Required only if you want automatic due-date email reminders enabled.

## Database Setup (Schema + RLS)

`insforge/schema.sql` configures:

- `boards`, `tasks`, and `profiles` tables
- indexes for board/task query performance
- automatic `updated_at` triggers
- strict RLS policies bound to `auth.uid()`
- scoped grants (`authenticated` allowed, `anon` denied)
- realtime channel + publish trigger for board-level task events

## Available Scripts

```bash
npm run dev    # Start local dev server
npm run lint   # Run ESLint
npm run build  # Create production build
npm run start  # Start production server
```

## Application Routes

- `/login` — Sign in
- `/register` — Sign up
- `/` — Authenticated Kanban workspace

## Project Structure

```text
app/
  components/kanban/   # Board, columns, cards, auth screen
  hooks/               # Kanban, auth, realtime logic
  login/               # Login page
  register/            # Register page
insforge/
  schema.sql           # Database schema, RLS, realtime triggers/policies
lib/
  insforge/            # InsForge client and helpers
```

## Security Model

- All board/task/profile access is scoped per authenticated user.
- RLS is enabled and forced on core tables.
- Realtime channel read permissions are limited to channels linked to the user’s boards.

## Troubleshooting

- **Invalid InsForge environment variables:** verify URL/key are real project values.
- **Auth appears misconfigured:** ensure InsForge auth settings match your expected verification method.
- **No realtime updates:** confirm schema was fully applied and realtime policies/triggers were created.
- **AI generation fails:** confirm the selected model is active in your InsForge project.

## Roadmap Ideas

- Team workspaces and shared boards
- Task comments and activity timeline
- Attachments per task
- Board templates and task recurrence
- Filters, saved views, and search
