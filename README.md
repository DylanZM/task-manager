# Kanban Task Manager

A modern, real-time Kanban board for managing tasks with drag-and-drop, AI-powered descriptions, and team-ready features.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4)

## Features

- **Multi-board workspace** — create, switch between, and delete boards
- **Kanban workflow** — drag tasks across columns (backlog, in progress, done)
- **Task management** — set title, description, priority, and due dates
- **AI descriptions** — auto-generate task descriptions from the title
- **Real-time sync** — updates reflect instantly across all open sessions
- **Per-user isolation** — your data stays yours with row-level security

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Backend | (Auth, Postgres, Realtime, AI) |
| Linting | ESLint |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).




## Security

- All data access is scoped per authenticated user.
- Row-Level Security (RLS) is enforced on every table.
- Realtime channels are restricted to the user's boards.

## Roadmap

- Team workspaces and shared boards
- Task comments and activity timeline
- File attachments per task
- Board templates and recurring tasks
- Saved views and search
