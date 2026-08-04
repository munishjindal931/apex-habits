# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project overview

Expo (SDK 54, managed workflow) + React Native + TypeScript. A habit-tracker app built around an app-design framework: core function (create/track habits, both once-a-day and multiple-times-a-day types), core loop (checking off a habit triggers a haptic + chime + animated celebration, with 3-day challenges for a bigger reward), accessory features (per-habit history/heatmap, an aggregate consistency chart), a 6-screen surface area, and a retention hook (local daily reminder notifications). Everything is persisted locally via AsyncStorage — there is no backend. No test or lint tooling is configured.

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
- `src/screens/` (Onboarding, Home, AddEditHabit, HabitDetail, Progress, Settings) are wired up by `src/navigation/RootNavigator.tsx` (`@react-navigation/native-stack`), which shows only the onboarding screen until `settings.onboardingComplete` is set. `src/components/` holds the shared presentational pieces (`HabitCard`, `ChallengeBanner`, `ConsistencyChart`, `CalendarHeatmap`, `CelebrationOverlay`).
- `assets/sounds/{habit-complete,challenge-complete}.wav` are currently silent placeholders (synthesized locally, not sourced from any audio library) so the `expo-audio` playback path is fully wired end-to-end — drop in real chime files at those same paths to enable actual sound with no code changes.
- `app.json` holds the Expo config (app name/slug, icons, adaptive icon assets, config plugins for `expo-audio`/`expo-font`/`expo-asset`, etc.). There are no native `ios/`/`android/` directories (managed workflow; they're gitignored if generated) — native-level config changes go through `app.json`, not native project files.

## SDK version constraint

See @AGENTS.md — this project is intentionally pinned to Expo SDK 54 rather than the latest SDK, to match the Expo Go client version available for on-device testing.
