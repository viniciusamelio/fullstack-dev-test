import 'package:flutter/material.dart';
import 'package:smash_app/presentation/theme/app_colors.dart';

/// Atom: a generic labeled dropdown. No domain knowledge — the caller
/// supplies the options and how to label each one. Styled via
/// `ThemeData.inputDecorationTheme` (see `presentation/theme/app_theme.dart`)
/// rather than `mix` directly — `DropdownButtonFormField` is a stock
/// Material widget with no `mix` equivalent. See `DESIGN.md` →
/// "Components" → "Input / dropdown".
class AppDropdown<T> extends StatelessWidget {
  const AppDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.options,
    required this.optionLabel,
    required this.onChanged,
  });

  final String label;
  final T value;
  final List<T> options;
  final String Function(T) optionLabel;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      dropdownColor: AppColors.surfaceRaised.resolve(context),
      decoration: InputDecoration(labelText: label),
      items: [
        for (final option in options)
          DropdownMenuItem(value: option, child: Text(optionLabel(option))),
      ],
      onChanged: (next) {
        if (next != null) onChanged(next);
      },
    );
  }
}
