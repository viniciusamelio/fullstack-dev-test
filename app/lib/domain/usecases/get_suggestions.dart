import 'package:fpdart/fpdart.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';

/// Orchestrates fetching suggestions for a given [SuggestionRequest].
/// Interface only — no I/O, no framework — implemented in
/// `data/usecases/get_suggestions_impl.dart`. Mirrors the backend's
/// `domain/usecases/generate-suggestions.ts`.
abstract interface class GetSuggestions {
  TaskEither<SuggestionsFailure, SuggestionResult> call(
    SuggestionRequest request,
  );
}
