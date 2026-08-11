import 'package:equatable/equatable.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';

sealed class SuggestionsEvent extends Equatable {
  const SuggestionsEvent();

  @override
  List<Object?> get props => [];
}

/// The user picked an occasion + relationship and asked for suggestions.
final class SuggestionsRequested extends SuggestionsEvent {
  const SuggestionsRequested({
    required this.occasion,
    required this.relationship,
  });

  final Occasion occasion;
  final Relationship relationship;

  @override
  List<Object?> get props => [occasion, relationship];
}
