import 'package:mix/mix.dart';

/// Spacing tokens — 4px base scale, see `DESIGN.md` → "Spacing".
abstract final class AppSpacing {
  static const xs = SpaceToken('xs');
  static const sm = SpaceToken('sm');
  static const md = SpaceToken('md');
  static const lg = SpaceToken('lg');
  static const xl = SpaceToken('xl');
  static const xxl = SpaceToken('xxl');

  static final values = <SpaceToken, double>{
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  };
}
