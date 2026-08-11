import 'package:flutter/material.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/presentation/widgets/atoms/app_button.dart';
import 'package:smash_app/presentation/widgets/molecules/occasion_field.dart';
import 'package:smash_app/presentation/widgets/molecules/relationship_field.dart';

/// Organism: occasion + relationship pickers and the submit button — a
/// self-contained section, stateful only for the currently-selected
/// values (the request/response lifecycle itself lives in the bloc).
class SuggestionForm extends StatefulWidget {
  const SuggestionForm({
    super.key,
    required this.onSubmit,
    this.busy = false,
    this.initialOccasion = Occasion.birthday,
    this.initialRelationship = Relationship.friend,
  });

  final void Function(Occasion occasion, Relationship relationship) onSubmit;
  final bool busy;
  final Occasion initialOccasion;
  final Relationship initialRelationship;

  @override
  State<SuggestionForm> createState() => _SuggestionFormState();
}

class _SuggestionFormState extends State<SuggestionForm> {
  late Occasion _occasion = widget.initialOccasion;
  late Relationship _relationship = widget.initialRelationship;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        OccasionField(
          value: _occasion,
          onChanged: (value) => setState(() => _occasion = value),
        ),
        const SizedBox(height: 12),
        RelationshipField(
          value: _relationship,
          onChanged: (value) => setState(() => _relationship = value),
        ),
        const SizedBox(height: 16),
        AppButton(
          label: 'Get suggestions',
          busy: widget.busy,
          onPressed: () => widget.onSubmit(_occasion, _relationship),
        ),
      ],
    );
  }
}
