import 'package:flutter/material.dart';
import 'package:mix/mix.dart';

/// Color tokens — see `DESIGN.md` → "Color" for the palette this
/// implements. Referenced as `AppColors.surfaceBase()` etc (calling a
/// [ColorToken] returns a [ColorRef] that `mix` resolves against
/// [AppTheme]'s [MixThemeData] at build time).
abstract final class AppColors {
  static const surfaceSunken = ColorToken('surfaceSunken');
  static const surfaceBase = ColorToken('surfaceBase');
  static const surfaceRaised = ColorToken('surfaceRaised');
  static const surfaceRaisedHover = ColorToken('surfaceRaisedHover');
  static const border = ColorToken('border');
  static const textPrimary = ColorToken('textPrimary');
  static const textSecondary = ColorToken('textSecondary');
  static const textMuted = ColorToken('textMuted');
  static const accent = ColorToken('accent');
  static const accentHover = ColorToken('accentHover');
  static const danger = ColorToken('danger');

  static final values = <ColorToken, Color>{
    surfaceSunken: Color(0xFF000000),
    surfaceBase: Color(0xFF0B0B0D),
    surfaceRaised: Color(0xFF1C1C1F),
    surfaceRaisedHover: Color(0xFF232327),
    border: Color(0xFF27272A),
    textPrimary: Color(0xFFFAFAFA),
    textSecondary: Color(0xFF9CA3AF),
    textMuted: Color(0xFF6B6B72),
    accent: Color(0xFF6366F1),
    accentHover: Color(0xFF4F46E5),
    danger: Color(0xFFEF4444),
  };
}
