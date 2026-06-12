# TimeToLearn

> A learning companion web app — flashcards, habit tracking, and a focus dashboard — built to study smarter and to learn modern React in the process.

🚧 **Work in progress.** This is an actively developed learning project, not a finished product. It's here to grow in public and document my progress as a developer.

## ✨ Features

- **Authentication** — sign up, sign in, sign out with Supabase Auth, protected routes
- **Flashcards** — create decks, add/remove cards, study mode with card flipping
- **Study session** — mark cards as *known* / *not known*, see a summary, and replay your mistakes
- **Habit tracker** — track daily habits (in progress)
- **Dashboard** — focus-oriented landing page with a weekly chart and widgets
- **Glassmorphism UI** — custom glass panels with a subtle tilt-on-hover effect

## 🛠 Tech Stack

| Area      | Choice |
|-----------|--------|
| Framework | React 19 + Vite |
| Routing   | React Router 7 |
| Backend   | Supabase (PostgreSQL + Auth + Row Level Security) — no custom server |
| Styling   | Tailwind CSS v4 (`@tailwindcss/vite`, design tokens via `@theme`) |
| Icons     | Font Awesome |
| Language  | JavaScript |

**Architecture note:** the React app talks to Supabase directly. Instead of an Express server checking ownership on every request, the database enforces access with **Row Level Security** policies (`auth.uid() = user_id`). Simpler and safe for this kind of app.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
#   then fill in your Supabase URL and anon key

# 3. (Optional) Set up the database
#   Run supabase/schema.sql in your Supabase SQL editor

# 4. Start the dev server
npm run dev
```

Scripts: `npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## 📁 Project Structure

```
src/
├── components/   # Navbar, Sidebar, AppLayout, ProtectedRoute, DeckCard, ...
├── pages/        # Login, Register, Dashboard, Flashcards, DeckDetail, Habits
├── services/     # supabase.js — the single point of contact with the DB
├── context/      # AuthContext.jsx (user + signIn/signUp/signOut)
├── widgets/      # dashboard widgets
├── config/       # constants
└── utils/        # helpers (e.g. glass tilt effect)
```

## 🗺 Roadmap

- [ ] Spaced repetition (SRS) — schedule reviews by date
- [ ] Quiz & writing study modes
- [ ] Customizable habit tracker (add/remove habits, icons)
- [ ] Stats page — progress charts and session history
- [ ] AI-generated flashcards from pasted notes

---

## 🇵🇱 Po polsku

**TimeToLearn** to aplikacja webowa wspierająca naukę — fiszki, tracker nawyków
i dashboard do skupienia. Buduję ją, żeby uczyć się efektywniej i przy okazji
opanować nowoczesny React.

To projekt **w trakcie budowy** i jednocześnie mój dziennik nauki programowania —
rozwijam go małymi krokami i rozwijam publicznie, żeby dokumentować postępy.

**Stack:** React 19 + Vite · React Router 7 · Supabase (PostgreSQL + Auth + RLS) ·
Tailwind CSS v4 · Font Awesome.

Uruchomienie: zainstaluj zależności (`npm install`), skopiuj `.env.example` do
`.env` i uzupełnij dane z Supabase, a następnie odpal `npm run dev`.
