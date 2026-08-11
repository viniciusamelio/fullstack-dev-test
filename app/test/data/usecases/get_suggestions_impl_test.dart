import 'package:flutter_test/flutter_test.dart';
import 'package:fpdart/fpdart.dart';
import 'package:smash_app/data/usecases/get_suggestions_impl.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/domain/repositories/suggestions_repository.dart';

class _FakeSuggestionsRepository implements SuggestionsRepository {
  _FakeSuggestionsRepository(this._result);

  final TaskEither<SuggestionsFailure, SuggestionResult> _result;
  SuggestionRequest? receivedRequest;

  @override
  TaskEither<SuggestionsFailure, SuggestionResult> getSuggestions(
    SuggestionRequest request,
  ) {
    receivedRequest = request;
    return _result;
  }
}

void main() {
  const request = SuggestionRequest(
    occasion: Occasion.birthday,
    relationship: Relationship.friend,
  );

  test('delegates the request to the repository and returns its Right', () async {
    const result = SuggestionResult(
      messages: ['a', 'b', 'c'],
      source: SuggestionSource.llm,
    );
    final repository = _FakeSuggestionsRepository(TaskEither.right(result));
    final usecase = GetSuggestionsImpl(repository);

    final either = await usecase(request).run();

    expect(repository.receivedRequest, request);
    expect(either, const Right<SuggestionsFailure, SuggestionResult>(result));
  });

  test('propagates the repository Left unchanged', () async {
    const failure = NetworkFailure();
    final repository = _FakeSuggestionsRepository(TaskEither.left(failure));
    final usecase = GetSuggestionsImpl(repository);

    final either = await usecase(request).run();

    expect(either, const Left<SuggestionsFailure, SuggestionResult>(failure));
  });
}
