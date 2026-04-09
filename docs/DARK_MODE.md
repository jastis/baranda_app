# Dark Mode Implementation

## Overview

The Aswani app now supports dark mode with three theme options:
- **Light**: Classic light theme
- **Dark**: Dark theme for low-light environments
- **Auto**: Automatically follows system settings

## Features

### Theme Context (`src/contexts/ThemeContext.tsx`)
- Centralized theme management using React Context
- Persistent theme preference using AsyncStorage
- System theme detection and auto-switching
- Type-safe theme colors for consistent styling

### Theme Colors

#### Light Theme
- Primary: `#2563eb` (Blue)
- Background: `#f5f5f5` (Light gray)
- Surface: `#ffffff` (White)
- Text: `#333333` (Dark gray)

#### Dark Theme
- Primary: `#3b82f6` (Lighter blue)
- Background: `#121212` (True black)
- Surface: `#1e1e1e` (Dark gray)
- Text: `#ffffff` (White)

## Usage

### Accessing Theme in Components

```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, themeMode, setThemeMode } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello World</Text>
    </View>
  );
};
```

### Changing Theme

Users can change the theme in **Settings > Appearance > Theme**:
1. Open the app
2. Navigate to Settings
3. Tap on "Appearance" section
4. Tap on "Theme"
5. Select Light, Dark, or Auto

### Programmatically Change Theme

```tsx
const { setThemeMode } = useTheme();

// Set to light mode
setThemeMode('light');

// Set to dark mode
setThemeMode('dark');

// Set to auto (follows system)
setThemeMode('auto');
```

## Implementation Details

### App Initialization
The `ThemeProvider` wraps the entire app in `App.tsx`:

```tsx
<ThemeProvider>
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
</ThemeProvider>
```

### Navigation Integration
The navigation theme is automatically updated based on the selected theme in `AppNavigator.tsx`:

```tsx
const navigationTheme = {
  dark: theme.isDark,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.error,
  },
};
```

### StatusBar
The status bar automatically adapts to the theme using Expo's `StatusBar` component with `style="auto"`.

## Available Theme Colors

| Color Property | Light Theme | Dark Theme | Usage |
|---------------|-------------|------------|-------|
| primary | #2563eb | #3b82f6 | Primary actions, buttons |
| primaryDark | #1e40af | #2563eb | Pressed states |
| secondary | #667eea | #818cf8 | Secondary elements |
| background | #f5f5f5 | #121212 | Screen backgrounds |
| surface | #ffffff | #1e1e1e | Card backgrounds |
| text | #333333 | #ffffff | Primary text |
| textSecondary | #666666 | #b3b3b3 | Secondary text |
| border | #dddddd | #3a3a3a | Borders, dividers |
| error | #ff4444 | #ff6b6b | Error messages |
| success | #4caf50 | #66bb6a | Success messages |
| warning | #ff9800 | #ffa726 | Warning messages |
| info | #2196f3 | #42a5f5 | Info messages |
| placeholder | #999999 | #888888 | Placeholder text |
| disabled | #cccccc | #555555 | Disabled elements |

## Best Practices

1. **Always use theme colors**: Never hardcode colors. Always use `theme.colors.*`
2. **Test both themes**: Ensure all screens look good in both light and dark modes
3. **Consider contrast**: Maintain good contrast ratios for accessibility
4. **Use surface colors for cards**: Use `theme.colors.surface` for card backgrounds instead of white
5. **Adapt icons**: Consider using different icon tints for dark mode

## Future Enhancements

- [ ] Add custom color schemes (e.g., blue, green, purple)
- [ ] Add high contrast mode for accessibility
- [ ] Add scheduled theme switching (e.g., light during day, dark at night)
- [ ] Per-screen theme overrides for special cases
