import 'package:equatable/equatable.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';

/// The two inputs the user provides: which occasion and which relationship
/// the gift-card message is for.
class SuggestionRequest extends Equatable {
  const SuggestionRequest({required this.occasion, required this.relationship});

  final Occasion occasion;
  final Relationship relationship;

  @override
  List<Object?> get props => [occasion, relationship];
}
