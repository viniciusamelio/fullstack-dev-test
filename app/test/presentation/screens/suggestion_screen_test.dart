import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mix/mix.dart';
import 'package:mocktail/mocktail.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_bloc.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_event.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_state.dart';
import 'package:smash_app/presentation/screens/suggestion_screen.dart';
import 'package:smash_app/presentation/theme/app_theme.dart';

class _MockSuggestionsBloc extends MockBloc<SuggestionsEvent, SuggestionsState>
    implements SuggestionsBloc {}

Future<void> _pump(
  WidgetTester tester,
  SuggestionsBloc bloc,
  SuggestionsState state,
) {
  whenListen(bloc, const Stream<SuggestionsState>.empty(), initialState: state);
  return tester.pumpWidget(
    MaterialApp(
      theme: buildMaterialThemeData(),
      builder: (context, child) =>
          MixTheme(data: buildMixThemeData(), child: child!),
      home: BlocProvider<SuggestionsBloc>.value(
        value: bloc,
        child: const SuggestionScreen(),
      ),
    ),
  );
}

void main() {
  setUpAll(() {
    registerFallbackValue(
      const SuggestionsRequested(
        occasion: Occasion.birthday,
        relationship: Relationship.friend,
      ),
    );
  });

  testWidgets('shows the form and no result/error in the initial state', (
    tester,
  ) async {
    final bloc = _MockSuggestionsBloc();

    await _pump(tester, bloc, const SuggestionsInitial());

    expect(find.text('Get suggestions'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets(
    'shows exactly one loading indicator while loading (the button\'s)',
    (tester) async {
      final bloc = _MockSuggestionsBloc();

      await _pump(tester, bloc, const SuggestionsLoading());

      // Regression check: the screen used to also render a standalone
      // LoadingIndicator below the form, duplicating the submit button's
      // own busy spinner.
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    },
  );

  testWidgets('shows the 3 messages on success', (tester) async {
    final bloc = _MockSuggestionsBloc();

    await _pump(
      tester,
      bloc,
      const SuggestionsSuccess(
        SuggestionResult(
          messages: ['One', 'Two', 'Three'],
          source: SuggestionSource.llm,
        ),
      ),
    );

    expect(find.text('One'), findsOneWidget);
    expect(find.text('Two'), findsOneWidget);
    expect(find.text('Three'), findsOneWidget);
  });

  testWidgets('shows an error message and lets the user retry', (
    tester,
  ) async {
    final bloc = _MockSuggestionsBloc();

    await _pump(tester, bloc, const SuggestionsError(NetworkFailure()));

    expect(
      find.text("Can't reach the server. Check your connection and try again."),
      findsOneWidget,
    );
    expect(find.text('Retry'), findsOneWidget);

    await tester.tap(find.text('Retry'));
    verify(() => bloc.add(any())).called(1);
  });
}
