# 🌑 Apex Habits · Minimalist Dark Mode Habit Tracker

A sleek, modern cross-platform habit tracking application built with **React Native (Expo SDK 54)** and **TypeScript**. Designed with a **pitch-dark minimalist aesthetic (`#0B0B0E`)**, 1-tap habit presets, kickstart streak challenges, consistency analytics, calendar heatmaps, and developer testing tools.

---

## ✨ Features

* 🌑 **Minimalist Pitch-Dark UI**: Engineered with a deep `#0B0B0E` canvas, surface dark cards (`#16161A`), high-contrast pure white typography (`#F4F4F5`), and emerald completion badges (`#22C55E`).
* ⚡ **1-Tap Preset Habit Selector**: Choose from curated habit presets (*Drink Water, Morning Workout, Read 20 Pages, Daily Meditation, Eat Healthy, Sleep 8 Hours, Practice Coding, Night Journaling, 10,000 Steps*) with automatic icons, color palettes, and default alarms.
* 🏆 **Kickstart Challenges (3, 7, 14, 30 Days)**: Launch streak challenges for any habit featuring visual progress bars, completion ratios, and reward milestone overlays.
* 📊 **Analytics & Heatmaps**: 
  * 7-day daily consistency bar charts.
  * 30-day overall completion trend charts.
  * GitHub-style 30-day calendar heatmaps with habit-specific color themes.
* ⏰ **Custom Alarms & Reminders**: Set custom daily reminder times per habit with active alarm status confirmation badges.
* 🧪 **Developer Test Tools**: Built-in dev tools modal supporting:
  * **Time Travel Simulation** (+1 Day, +3 Days, Date Reset).
  * **Celebration Overlays** (sound & haptics test).
  * **Fast-Forward Challenges** (auto-completing active streak challenges).
  * **14-Day History Mock Data Seeding**.
* 📱 **Cross-Platform**: Tested on Web (responsive desktop container) and iOS / Android via **Expo Go (SDK 54)**.

---

## 🛠️ Technology Stack

* **Framework**: React Native with Expo SDK 54
* **Language**: TypeScript
* **Navigation**: React Navigation (Native Stack with Dark Theme)
* **Icons**: `@expo/vector-icons` (Ionicons)
* **Storage**: `@react-native-async-storage/async-storage`
* **Feedback**: `expo-audio` & `expo-haptics`

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18+`
* **npm** or **yarn**
* **Expo Go App** on iOS or Android (if testing on phone)

### Installation
```bash
# Clone the repository
git clone https://github.com/munishjindal931/apex-habits.git

# Navigate into project directory
cd apex-habits

# Install dependencies
npm install
```

### Running the App

#### Web Browser:
```bash
npx expo start --web
```
Open [http://localhost:8082](http://localhost:8082) in Chrome.

#### On Your Mobile Device (Expo Go):
```bash
npx expo start --clear
```
Scan the ASCII **QR Code** in your terminal using the **Expo Go** app (Android) or **Camera** app (iOS).

---

## 📂 Project Structure

```text
├── App.tsx                    # Application entry point with SafeArea & Light StatusBar
├── app.json                   # Expo SDK 54 configuration & Dark userInterfaceStyle
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── CalendarHeatmap.tsx     # 30-day habit history grid
│   │   ├── CelebrationOverlay.tsx  # Confetti & reward overlay
│   │   ├── ChallengeBanner.tsx     # Responsive kickstart challenge progress card
│   │   ├── ConsistencyChart.tsx    # Bar chart for consistency trends
│   │   ├── CreateChallengeModal.tsx# Kickstart challenge setup sheet
│   │   ├── DevToolsModal.tsx       # Developer testing & time travel tools
│   │   ├── HabitCard.tsx           # Minimalist dark habit card with stepper & checkmark
│   │   └── PresetSelector.tsx      # 1-tap preset habit scroll pills
│   ├── constants/             # Habit presets, icon sets, & color palettes
│   ├── context/               # Global state & persistence (AppDataContext)
│   ├── habitUtils.ts          # Streak math, simulated date offset, & completion rates
│   ├── navigation/            # Root stack navigator with MinimalDarkTheme
│   ├── screens/               # Main application views
│   │   ├── HomeScreen.tsx          # Today screen & Hero progress card
│   │   ├── HabitDetailScreen.tsx   # Individual habit analytics & log history
│   │   ├── ProgressScreen.tsx      # Overview trends & active/past challenges
│   │   ├── SettingsScreen.tsx      # App options & dev tools entry
│   │   ├── AddEditHabitScreen.tsx  # Habit creation & editing form
│   │   └── OnboardingScreen.tsx    # First-run onboarding flow
│   └── types.ts               # TypeScript data models
```

---

## 📄 License
This project is open source and available under the **MIT License**.
