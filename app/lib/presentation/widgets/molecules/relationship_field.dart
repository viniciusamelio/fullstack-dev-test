import 'package:flutter/material.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/presentation/widgets/atoms/app_dropdown.dart';

/// Molecule: [AppDropdown] specialized for picking a [Relationship].
class RelationshipField extends StatelessWidget {
  const RelationshipField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final Relationship value;
  final ValueChanged<Relationship> onChanged;

  @override
  Widget build(BuildContext context) {
    return AppDropdown<Relationship>(
      label: 'Relationship',
      value: value,
      options: Relationship.values,
      optionLabel: (relationship) => relationship.label,
      onChanged: onChanged,
    );
  }
}
