import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/usecases/get_suggestions.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_event.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_state.dart';

class SuggestionsBloc extends Bloc<SuggestionsEvent, SuggestionsState> {
  SuggestionsBloc(this._getSuggestions) : super(const SuggestionsInitial()) {
    on<SuggestionsRequested>(_onRequested);
  }

  final GetSuggestions _getSuggestions;

  Future<void> _onRequested(
    SuggestionsRequested event,
    Emitter<SuggestionsState> emit,
  ) async {
    emit(const SuggestionsLoading());

    final result = await _getSuggestions(
      SuggestionRequest(
        occasion: event.occasion,
        relationship: event.relationship,
      ),
    ).run();

    result.match(
      (failure) => emit(SuggestionsError(failure)),
      (suggestions) => emit(SuggestionsSuccess(suggestions)),
    );
  }
}
