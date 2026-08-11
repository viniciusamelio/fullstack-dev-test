import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:smash_app/domain/enums/occasion.dart';
import 'package:smash_app/domain/enums/relationship.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_bloc.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_event.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_state.dart';
import 'package:smash_app/presentation/widgets/molecules/error_banner.dart';
import 'package:smash_app/presentation/widgets/organisms/suggestion_form.dart';
import 'package:smash_app/presentation/widgets/organisms/suggestions_list.dart';
import 'package:smash_app/presentation/widgets/templates/suggestion_screen_template.dart';

/// Page: the only widget that talks to [SuggestionsBloc]. Decides which
/// organism/atom to slot into [SuggestionScreenTemplate] for the current
/// state; everything below it (form, list, error banner) is dumb and
/// state-free.
class SuggestionScreen extends StatefulWidget {
  const SuggestionScreen({super.key});

  @override
  State<SuggestionScreen> createState() => _SuggestionScreenState();
}

class _SuggestionScreenState extends State<SuggestionScreen> {
  Occasion _lastOccasion = Occasion.birthday;
  Relationship _lastRelationship = Relationship.friend;

  void _request(Occasion occasion, Relationship relationship) {
    _lastOccasion = occasion;
    _lastRelationship = relationship;
    context.read<SuggestionsBloc>().add(
      SuggestionsRequested(occasion: occasion, relationship: relationship),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SuggestionScreenTemplate(
      body: BlocBuilder<SuggestionsBloc, SuggestionsState>(
        builder: (context, state) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SuggestionForm(
                initialOccasion: _lastOccasion,
                initialRelationship: _lastRelationship,
                busy: state is SuggestionsLoading,
                onSubmit: _request,
              ),
              const SizedBox(height: 24),
              switch (state) {
                // The submit button already shows its own busy spinner
                // (`SuggestionForm`'s `busy:` above) — nothing else to
                // render here, or there'd be two spinners on screen.
                SuggestionsInitial() || SuggestionsLoading() =>
                  const SizedBox.shrink(),
                SuggestionsSuccess(:final result) => SuggestionsList(
                  result: result,
                ),
                SuggestionsError(:final failure) => ErrorBanner(
                  failure: failure,
                  onRetry: () => _request(_lastOccasion, _lastRelationship),
                ),
              },
            ],
          );
        },
      ),
    );
  }
}
