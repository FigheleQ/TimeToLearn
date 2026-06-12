# TimeToLearn

A web app for learning — flashcards, habit tracking, and a focus dashboard.
Built as a side project to practice modern React and study more effectively.

Work in progress. Actively developed, not a finished product.

## Features

- **Authentication** — sign up, sign in, sign out with Supabase Auth, protected routes
- **Flashcards** — create decks, add/remove cards, study mode with card flipping
- **Study session** — mark cards as known / not known, see a summary, replay mistakes
- **Habit tracker** — track daily habits (in progress)
- **Dashboard** — weekly chart and widgets
- **Glassmorphism UI** — glass panels with a tilt-on-hover effect

## Tech Stack

| Area      | Choice |
|-----------|--------|
| Framework | React 19 + Vite |
| Routing   | React Router 7 |
| Backend   | Supabase (PostgreSQL + Auth + Row Level Security) |
| Styling   | Tailwind CSS v4 |
| Icons     | Font Awesome |
| Language  | JavaScript |

The React app talks to Supabase directly — no custom server.
Access control is handled by Row Level Security policies on the database side.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your Supabase URL and anon key
npm run dev
```

Optionally run `supabase/schema.sql` in your Supabase SQL editor to set up the database.

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## Project Structure

src/

├── components/   # Navbar, Sidebar, AppLayout, ProtectedRoute, DeckCard...

├── pages/        # Login, Register, Dashboard, Flashcards, DeckDetail, Habits

├── services/     # supabase.js — single point of contact with the DB

├── context/      # AuthContext.jsx

├── widgets/      # dashboard widgets

└── utils/        # helpers


## Roadmap

- [ ] Spaced repetition — schedule reviews by date
- [ ] Quiz and writing study modes
- [ ] Customizable habit tracker
- [ ] Stats page with session history
- [ ] AI-generated flashcards from pasted notes
