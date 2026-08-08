# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project overview

Expo (SDK 54, managed workflow) + React Native + TypeScript. A habit-tracker app built around an app-design framework: core function (create/track habits, both once-a-day and multiple-times-a-day types), core loop (checking off a habit triggers a haptic + chime + animated celebration, with 3-day challenges for a bigger reward), accessory features (per-habit history/heatmap, an aggregate consistency chart), a 7-screen surface area, and a retention hook (local daily reminder notifications). All data is persisted locally via AsyncStorage first, then mirrored to a Supabase project for auth + bi-directional cloud sync (see below) — the local cache is authoritative and the app is fully usable offline. No test or lint tooling is configured.

## Commands

- `npm start` — start the Metro dev server (connect via Expo Go or a dev client)
- `npm run ios` / `npm run android` / `npm run web` — start the dev server targeting a specific platform
- `npx tsc --noEmit` — typecheck the project (there is no separate lint or test script)
- `npx expo-doctor` — validate that dependency versions are consistent with the installed Expo SDK
- `npx expo install <package>` — always use this (not raw `npm install`) when adding an RN/Expo package, so the resolved version matches the project's SDK

## Architecture

- Entry point: `index.ts` calls `registerRootComponent(App)` from `App.tsx`, which just wraps `SafeAreaProvider` + `AppDataProvider` (`src/context/AppDataContext.tsx`) around `RootNavigator` (`src/navigation/RootNavigator.tsx`).
- `src/types.ts` defines `Habit` (`type: 'binary' | 'count'`, a `log: Record<dateKey, count>`), `Challenge`, and `Settings`. A day counts as complete when `log[date] >= targetCount` — see `isDayComplete` in `src/habitUtils.ts`, which also has `getStreak`, `getBestStreak`, `getConsistencySeries`, and date-key helpers (`todayKey`/`dateKeyDaysAgo`/`dateKeyDaysAfter` — these build/format dates from local `Date` components only, deliberately never touching `.toISOString()`, to avoid UTC-vs-local day-boundary bugs).
- `src/storage.ts` loads/saves three AsyncStorage keys (`habit-tracker:habits`, `:challenges`, `:settings`) and migrates the old single-screen demo's `completedDates: string[]` shape into the new `log` shape on read.
- `src/hooks/{useHabits,useChallenges,useSettings}.ts` each own one slice of persisted state. `src/context/AppDataContext.tsx` composes all three plus the chime player into one `useAppData()` hook consumed by every screen — it also owns `logHabit()` (the core-loop action: bumps today's count, detects the complete/challenge-complete transition, and triggers `feedback/celebrate.ts`).
- **Challenge progress is derived, not stored**: `getChallengeProgress(challenge, habit)` in `habitUtils.ts` walks the challenge's date window against the habit's `log` on every read, rather than duplicating a list of completed dates.
- `src/feedback/` holds the reward-loop side effects: `sound.ts` (expo-audio chime playback — see note below), `celebrate.ts` (haptics + sound, gated by `Settings`), `notifications.ts` (expo-notifications local daily reminders; scheduling is skipped on web, which doesn't implement it).
- `src/screens/` (Onboarding, Auth, Home, AddEditHabit, HabitDetail, Progress, Settings) are wired up by `src/navigation/RootNavigator.tsx` (`@react-navigation/native-stack`), which gates on two things in order: `settings.onboardingComplete` (shows `OnboardingScreen` — a single info screen whose "Get Started" button just flips that flag), then `user` (shows `AuthScreen` until a Supabase session exists). There is no way to reach the main app without signing in — habit creation happens from `HomeScreen` after auth, not during onboarding. `src/components/` holds the shared presentational pieces (`HabitCard`, `ChallengeBanner`, `ConsistencyChart`, `CalendarHeatmap`, `CelebrationOverlay`).
- `src/lib/supabase.ts` exports a stable singleton Supabase client (email/password auth, `AsyncStorage`-backed session persistence). `AppDataContext` subscribes to `supabase.auth.onAuthStateChange` and, on every sign-in, runs a bi-directional sync: local habits/logs/challenges are pushed up first (so anything created before auth isn't lost), then the full remote set is pulled down and merged in. Every mutating action (`addHabit`, `updateHabit`, `removeHabit`, `logHabit`, `startChallenge`) fires an async, best-effort Supabase write after updating local state — failures are only `console.warn`'d, never surfaced to the user, since local storage remains the source of truth.
- `src/lib/alert.ts` exports `showAlert()`, a drop-in replacement for RN's `Alert.alert()`. **Always use this instead of importing `Alert` from `react-native`** — `react-native-web`'s `Alert.alert` is a no-op (empty function body), so any screen using it directly will silently fail to show errors/confirmations when run with `npm run web`. `showAlert` falls back to `window.alert`/`window.confirm` on web and delegates to the native `Alert.alert` everywhere else.
- `assets/sounds/{habit-complete,challenge-complete}.wav` are currently silent placeholders (synthesized locally, not sourced from any audio library) so the `expo-audio` playback path is fully wired end-to-end — drop in real chime files at those same paths to enable actual sound with no code changes.
- `app.json` holds the Expo config (app name/slug, icons, adaptive icon assets, config plugins for `expo-audio`/`expo-font`/`expo-asset`, etc.). There are no native `ios/`/`android/` directories (managed workflow; they're gitignored if generated) — native-level config changes go through `app.json`, not native project files.

## Supabase setup

- Credentials live in `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`; see `.env.example`). `src/lib/supabase.ts` also hardcodes the same live project's values as a fallback, so the app works even if `.env` is missing — don't rely on that fallback for a different project, update both.
- Tables expected in Postgres: `habits`, `habit_logs`, `challenges`, each with a `user_id` column and RLS policies scoping rows to `auth.uid()`.

## SDK version constraint

See @AGENTS.md — this project is intentionally pinned to Expo SDK 54 rather than the latest SDK, to match the Expo Go client version available for on-device testing.
