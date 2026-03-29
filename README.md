# Ardsleypost

The social network built for Ardsley students, parents, and alumni.

## Features

- **Community Feed** — Share posts about events, services, and local happenings
- **Services Marketplace** — Find tutors, babysitters, dog walkers, and more
- **Direct Messaging** — Message other members privately
- **User Profiles** — View anyone's profile and post history
- **Payments** — Buy and sell services with Stripe integration
- **Public Browsing** — Browse the feed without signing in

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth with Google OAuth
- **Database:** Supabase (Postgres)
- **Payments:** Stripe
- **Native Apps:** Capacitor (iOS + Android)
- **Deployment:** Vercel

## Getting Started

```bash
pnpm install
pnpm dev
```

## Native Apps

### iOS

```bash
npx cap sync ios
```

Build and upload via GitHub Actions:

```bash
gh workflow run ios-build.yml
```

### Android

```bash
npx cap sync android
```

Build via GitHub Actions:

```bash
gh workflow run android-build.yml
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
