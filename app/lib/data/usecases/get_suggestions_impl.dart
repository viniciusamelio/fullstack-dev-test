import 'package:fpdart/fpdart.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/domain/repositories/suggestions_repository.dart';
import 'package:smash_app/domain/usecases/get_suggestions.dart';

/// Thin today — delegates straight to [SuggestionsRepository] — but this is
/// the seam for any future business logic (e.g. local caching of the last
/// result, client-side pre-validation) without touching Dio or the bloc.
/// Testable with a pure in-memory fake of [SuggestionsRepository], zero
/// knowledge of Dio or the generated client — same rationale as the
/// backend's `db-generate-suggestions.ts` (`api/CLAUDE.md` → "Architecture:
/// ports and adapters").
class GetSuggestionsImpl implements GetSuggestions {
  const GetSuggestionsImpl(this._repository);

  final SuggestionsRepository _repository;

  @override
  TaskEither<SuggestionsFailure, SuggestionResult> call(
    SuggestionRequest request,
  ) {
    return _repository.getSuggestions(request);
  }
}
