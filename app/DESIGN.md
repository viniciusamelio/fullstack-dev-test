# Design system

Look and feel reference: a dark, high-contrast dashboard UI (indigo accent
on near-black surfaces, generous rounding, muted secondary text). This
document is the token spec; [`mix`](https://fluttermix.com) is the styling
library that implements it — see `lib/presentation/theme/`.

**Scope note:** the reference screenshot is a generic multi-page dashboard
shell (sidebar nav with Dashboard/Team members/Projects/Reports). This app
is a single screen, so only the *visual language* — palette, type scale,
spacing, radii, component treatment, empty-state pattern — is adopted
below, not the literal nav structure.

## Color

Dark theme only (no light variant). Two surface tiers plus one accent.

| Token | Hex | Use |
|---|---|---|
| `surfaceSunken` | `#000000` | Page/scaffold background — the darkest layer |
| `surfaceBase` | `#0B0B0D` | Panel background (cards, the form area) |
| `surfaceRaised` | `#1C1C1F` | Inputs, hover states, the active-nav-item treatment |
| `surfaceRaisedHover` | `#232327` | Hover on an already-raised surface (e.g. secondary button hover) |
| `border` | `#27272A` | Hairline borders, dividers — used sparingly |
| `textPrimary` | `#FAFAFA` | Headings, primary labels, button text |
| `textSecondary` | `#9CA3AF` | Body copy, helper text, subtitles |
| `textMuted` | `#6B6B72` | Placeholders, disabled text, inactive nav icons |
| `accent` | `#6366F1` | Primary actions, active state, focus ring |
| `accentHover` | `#4F46E5` | Primary action hover/pressed |
| `danger` | `#EF4444` | Error icon/text |

## Typography

System sans-serif (`Inter`-like metrics — no custom font asset shipped;
`Theme.of(context).platform`'s default sans is close enough for a test
project). Sizes:

| Token | Size / weight | Use |
|---|---|---|
| `heading` | 20 / w600 | Screen title, empty-state heading |
| `body` | 14 / w400 | Form labels, message card text |
| `label` | 14 / w500 | Button labels, dropdown selected value |
| `caption` | 13 / w400 | Helper/subtitle text, source badge |

Line height 1.4 throughout.

## Spacing

4px base scale: `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `xxl=32`.

## Radius

`sm=6` (chips/badges), `md=8` (inputs, buttons), `lg=12` (cards/panels).

## Components

- **Button — primary**: `accent` fill, `textPrimary` label, `md` radius,
  `lg`/`sm` horizontal/vertical padding, hover → `accentHover`.
- **Button — secondary**: `surfaceRaised` fill, `textPrimary` label, same
  shape, hover → `surfaceRaisedHover`.
- **Input / dropdown**: `surfaceRaised` fill, no visible border at rest,
  `md` radius, `textMuted` placeholder, `accent` focus ring.
- **Card** (message suggestion): `surfaceBase` fill, `lg` radius, `lg`
  padding, `1px border` border.
- **Empty/error state**: centered column — `heading` text, `sm` gap,
  `textSecondary` subtitle, `xl` gap, then the action button(s).

## Implementation

`lib/presentation/theme/`:
- `app_colors.dart`, `app_spacing.dart`, `app_radii.dart`, `app_text_styles.dart`
  — the tables above as `mix` `ColorToken`/`SpaceToken`/`RadiusToken`/`TextStyleToken` maps.
- `app_theme.dart` — builds the `MixThemeData` from those tokens and a dark
  Material `ThemeData` (for the handful of stock Material widgets we still
  use, e.g. `DropdownButtonFormField`), wired in via `MixTheme` +
  `MaterialApp` in `main.dart`.

Custom atoms (`AppButton`, `MessageCard`, `ErrorBanner`'s icon well) are
built on `mix`'s `Box`/`StyledText`/`PressableBox` against these tokens
instead of raw `Container`/`Text`/ad-hoc `Color`s — see those files under
`lib/presentation/widgets/atoms/` for the concrete usage pattern.
