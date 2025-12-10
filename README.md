# 🔥 Kalorien Tracker

KI-gestützte Kalorienzählung mit Foto-Analyse. Fotografiere dein Essen, lass es von der KI analysieren und tracke deine Kalorien automatisch.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## Features

- 📸 **Foto-Analyse** – Fotografiere dein Essen, KI erkennt Kalorien & Makros
- 🔐 **User Accounts** – Registrierung, Login, Passwort-Reset via Supabase
- 📊 **Dashboard** – Tages- und Wochenziele im Blick
- 🍹 **Food & Drinks** – Unterscheidung zwischen Essen und Getränken
- 📱 **Mobile-First** – Optimiert für Smartphone-Nutzung
- ☁️ **Cloud-Sync** – Daten überall verfügbar

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Auth & DB:** Supabase (PostgreSQL)
- **AI:** Google Gemini Vision API

---

## 🚀 Setup

### 1. Repository klonen

```bash
git clone https://github.com/YOUR_USERNAME/calorie-tracker.git
cd calorie-tracker
npm install
```

### 2. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Warte bis das Projekt initialisiert ist

### 3. Datenbank Schema erstellen

1. Öffne den **SQL Editor** in deinem Supabase Dashboard
2. Kopiere den Inhalt von `supabase/schema.sql`
3. Führe das SQL aus

### 4. Environment Variables setzen

```bash
cp .env.example .env
```

Fülle die Werte aus:

```env
# Supabase (findest du unter Project Settings -> API)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Gemini API Key (https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY=AIzaSy...
```

### 5. App starten

```bash
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000)

---

## 📁 Projektstruktur

```
src/
├── components/       # React Komponenten
│   ├── AuthView.tsx
│   ├── OnboardingView.tsx
│   ├── DashboardView.tsx
│   ├── AnalysisView.tsx
│   └── SettingsView.tsx
├── contexts/         # React Context
│   └── AuthContext.tsx
├── hooks/            # Custom Hooks
│   ├── useProfile.ts
│   └── useMeals.ts
├── lib/              # Utilities & Services
│   ├── supabase.ts
│   ├── gemini.ts
│   └── calories.ts
├── types/            # TypeScript Types
│   └── index.ts
├── App.tsx           # Main App Component
├── main.tsx          # Entry Point
└── index.css         # Tailwind Styles

supabase/
└── schema.sql        # Database Schema
```

---

## 🔧 Supabase Konfiguration

### Authentication

Supabase Auth ist bereits konfiguriert. Optional kannst du weitere Provider aktivieren:

1. **Supabase Dashboard** → Authentication → Providers
2. Aktiviere z.B. Google, Apple, GitHub

### Email Templates (Optional)

Passe die Email-Templates für bessere UX an:

1. **Supabase Dashboard** → Authentication → Email Templates
2. Bearbeite: Confirmation, Reset Password, etc.

### Row Level Security

Das Schema hat bereits RLS aktiviert. Jeder User kann nur seine eigenen Daten sehen/bearbeiten.

---

## 🚢 Deployment

### Vercel (empfohlen)

```bash
npm install -g vercel
vercel
```

Environment Variables in Vercel Dashboard setzen!

### Netlify

```bash
npm run build
# Deploy dist/ Ordner zu Netlify
```

---

## 📝 API Limits

- **Supabase Free Tier:** 500MB DB, 50k Auth Users, 2GB Bandwidth
- **Gemini Free Tier:** 15 RPM, 1M Tokens/Tag

Für Production: Upgrade auf Supabase Pro & Gemini API Billing.

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

→ `.env` Datei erstellen und Werte aus Supabase Dashboard kopieren

### "API request failed" bei Analyse

→ Gemini API Key prüfen, ggf. neuen Key generieren

### Bilder werden nicht gespeichert

→ Bilder werden als Base64 in der DB gespeichert. Bei sehr großen Bildern: Bildkompression anpassen in `lib/gemini.ts`

---

## 📄 License

MIT

---

Made with ❤️ and 🤖
