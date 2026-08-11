import 'package:flutter/material.dart';
import 'package:mix/mix.dart';

/// Typography tokens, see `DESIGN.md` → "Typography".
///
/// Deliberately color-less — color is semantic (e.g. `textPrimary` vs
/// `textSecondary`) and applied per-usage via `$text.style.color.ref(...)`,
/// not baked into the size/weight token.
abstract final class AppTextStyles {
  static const heading = TextStyleToken('heading');
  static const body = TextStyleToken('body');
  static const label = TextStyleToken('label');
  static const caption = TextStyleToken('caption');

  static final values = <TextStyleToken, TextStyle>{
    heading: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, height: 1.4),
    body: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, height: 1.4),
    label: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, height: 1.4),
    caption: TextStyle(fontSize: 13, fontWeight: FontWeight.w400, height: 1.4),
  };
}
