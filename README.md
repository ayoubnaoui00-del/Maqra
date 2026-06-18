# Maqra

Maqra is a gamified reading logger app tailored to an imperial/ancient theme. The application allows users to add scrolls, track progress, initiate timed contemplation sessions, check stats with dynamic attributes (Zeal, Insight, Patience, Authority), and view completed book statistics in a bar chart.

## Technologies Used
- **Core Framework**: React Native with Expo (v56.0.0)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Fonts**: MedievalSharp (`MedievalSharp_400Regular`)
- **Animations**: `react-native-reanimated` (v4/v3)
- **Styling**: Vanilla CSS stylesheets utilizing Context-based thematic values.

## Key Features
- **Arabic RTL Layout Support (MAQ-33)**: Easily toggle Arabic Right-To-Left alignment under the settings panel in the Profile screen. This mirrors the text alignment and interface structures dynamically.
- **Reanimated Animations (MAQ-34)**: Powered by 5 distinct layout and shared-value transitions:
  1. *Grid Card entrance glide-ins* in the Library Directory.
  2. *Vertical Bar Chart height scaling* in the Profile Screen.
  3. *Pulsing gold Play/Pause seal* during reading sessions.
  4. *Animated SVG progress ring* dynamically tracking completed page fractions.
  5. *Chronicles history list fade-ins* under profile statistics.
- **Edge Case Recovery (MAQ-35)**:
  - Empty search / empty library layouts with instructions.
  - Custom camera permission alert guidance.
  - Page completed input validation and boundary protections.

## File Architecture
- `App.tsx`: Base navigation, layout switcher, font loader, and launch-time RTL restoration.
- `lib/rtl.ts`: RTL utility functions mapping interface directions, alignments, and toggles.
- `screens/LibraryScreen.tsx`: Grid-based main directory of texts with detail management and Summon Scroll modals.
- `screens/ReadingSessionScreen.tsx`: Timer session controller with haptics and progress rings.
- `screens/ProfileScreen.tsx`: User stats, customized gamified level metrics, and animated yearly statistics charts.
- `store/useBookStore.ts`: Dynamic Zustand store handling storage logic, streaks, profile options, and sessions.
- `src/theme.ts` & `src/theme/ThemeContext.tsx`: Layout-wide constants for unified UI styling.
