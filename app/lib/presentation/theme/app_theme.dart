import 'package:flutter/material.dart';
import 'package:mix/mix.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';
import 'package:smash_app/presentation/theme/app_radii.dart';
import 'package:smash_app/presentation/theme/app_spacing.dart';
import 'package:smash_app/presentation/theme/app_text_styles.dart';

/// The `mix` design tokens (see `DESIGN.md`), consumed by custom atoms via
/// `$box`/`$text` + `AppColors`/`AppSpacing`/`AppRadii`/`AppTextStyles`.
MixThemeData buildMixThemeData() {
  return MixThemeData(
    colors: AppColors.values,
    spaces: AppSpacing.values,
    radii: AppRadii.values,
    textStyles: AppTextStyles.values,
  );
}

/// Material [ThemeData] for the handful of stock Material widgets this app
/// still uses directly (`Scaffold`, `AppBar`, `DropdownButtonFormField`) —
/// kept in sync with the same tokens rather than Material's defaults.
ThemeData buildMaterialThemeData() {
  final colors = AppColors.values;
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: colors[AppColors.surfaceSunken],
    colorScheme: ColorScheme.fromSeed(
      seedColor: colors[AppColors.accent]!,
      brightness: Brightness.dark,
    ).copyWith(
      surface: colors[AppColors.surfaceSunken],
      primary: colors[AppColors.accent],
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: colors[AppColors.surfaceSunken],
      foregroundColor: colors[AppColors.textPrimary],
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: colors[AppColors.surfaceRaised],
      hintStyle: TextStyle(color: colors[AppColors.textMuted]),
      labelStyle: TextStyle(color: colors[AppColors.textSecondary]),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: colors[AppColors.accent]!),
      ),
    ),
    dropdownMenuTheme: DropdownMenuThemeData(
      menuStyle: MenuStyle(
        backgroundColor: WidgetStatePropertyAll(colors[AppColors.surfaceRaised]),
      ),
    ),
    popupMenuTheme: PopupMenuThemeData(color: colors[AppColors.surfaceRaised]),
    textTheme: Typography.whiteMountainView.apply(
      bodyColor: colors[AppColors.textPrimary],
      displayColor: colors[AppColors.textPrimary],
    ),
  );
}
