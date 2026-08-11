import 'package:flutter/material.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/presentation/widgets/atoms/app_dropdown.dart';

/// Molecule: [AppDropdown] specialized for picking an [Occasion].
class OccasionField extends StatelessWidget {
  const OccasionField({super.key, required this.value, required this.onChanged});

  final Occasion value;
  final ValueChanged<Occasion> onChanged;

  @override
  Widget build(BuildContext context) {
    return AppDropdown<Occasion>(
      label: 'Occasion',
      value: value,
      options: Occasion.values,
      optionLabel: (occasion) => occasion.label,
      onChanged: onChanged,
    );
  }
}
