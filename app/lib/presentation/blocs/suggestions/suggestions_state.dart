import 'package:equatable/equatable.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';

sealed class SuggestionsState extends Equatable {
  const SuggestionsState();

  @override
  List<Object?> get props => [];
}

/// Nothing requested yet.
final class SuggestionsInitial extends SuggestionsState {
  const SuggestionsInitial();
}

final class SuggestionsLoading extends SuggestionsState {
  const SuggestionsLoading();
}

final class SuggestionsSuccess extends SuggestionsState {
  const SuggestionsSuccess(this.result);

  final SuggestionResult result;

  @override
  List<Object?> get props => [result];
}

final class SuggestionsError extends SuggestionsState {
  const SuggestionsError(this.failure);

  final SuggestionsFailure failure;

  @override
  List<Object?> get props => [failure];
}
