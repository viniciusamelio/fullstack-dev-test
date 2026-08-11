import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fpdart/fpdart.dart';
import 'package:mocktail/mocktail.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/domain/usecases/get_suggestions.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_bloc.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_event.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_state.dart';

class _MockGetSuggestions extends Mock implements GetSuggestions {}

void main() {
  late _MockGetSuggestions getSuggestions;

  const event = SuggestionsRequested(
    occasion: Occasion.birthday,
    relationship: Relationship.friend,
  );

  setUpAll(() {
    registerFallbackValue(
      const SuggestionRequest(
        occasion: Occasion.birthday,
        relationship: Relationship.friend,
      ),
    );
  });

  setUp(() {
    getSuggestions = _MockGetSuggestions();
  });

  blocTest<SuggestionsBloc, SuggestionsState>(
    'emits [Loading, Success] when the usecase returns a Right',
    build: () {
      const result = SuggestionResult(
        messages: ['a', 'b', 'c'],
        source: SuggestionSource.llm,
      );
      when(() => getSuggestions(any())).thenReturn(TaskEither.right(result));
      return SuggestionsBloc(getSuggestions);
    },
    act: (bloc) => bloc.add(event),
    expect: () => const [
      SuggestionsLoading(),
      SuggestionsSuccess(
        SuggestionResult(messages: ['a', 'b', 'c'], source: SuggestionSource.llm),
      ),
    ],
  );

  blocTest<SuggestionsBloc, SuggestionsState>(
    'emits [Loading, Error] when the usecase returns a Left',
    build: () {
      when(
        () => getSuggestions(any()),
      ).thenReturn(TaskEither.left(const NetworkFailure()));
      return SuggestionsBloc(getSuggestions);
    },
    act: (bloc) => bloc.add(event),
    expect: () => const [
      SuggestionsLoading(),
      SuggestionsError(NetworkFailure()),
    ],
  );
}
