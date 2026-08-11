import 'package:fpdart/fpdart.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';

/// Port the data layer depends on to fetch suggestions, implemented in
/// `infra/repositories/suggestions_repository_impl.dart` against the
/// generated OpenAPI client. Mirrors the backend's
/// `data/protocols/llm-suggestion-gateway.ts` — an interface the domain/data
/// layers own, that infra implements.
abstract interface class SuggestionsRepository {
  TaskEither<SuggestionsFailure, SuggestionResult> getSuggestions(
    SuggestionRequest request,
  );
}
