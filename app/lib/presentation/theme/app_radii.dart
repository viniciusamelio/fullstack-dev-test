import 'package:flutter/material.dart';
import 'package:mix/mix.dart';

/// Radius tokens, see `DESIGN.md` → "Radius".
abstract final class AppRadii {
  static const sm = RadiusToken('sm');
  static const md = RadiusToken('md');
  static const lg = RadiusToken('lg');

  static final values = <RadiusToken, Radius>{
    sm: Radius.circular(6),
    md: Radius.circular(8),
    lg: Radius.circular(12),
  };
}
