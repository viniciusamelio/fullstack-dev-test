import 'package:smash_app/data/usecases/get_suggestions_impl.dart';
import 'package:smash_app/infra/network/dio_client.dart';
import 'package:smash_app/infra/repositories/suggestions_repository_impl.dart';
import 'package:smash_app/presentation/blocs/suggestions/suggestions_bloc.dart';
import 'package:suggestions_api_client/suggestions_api_client.dart';

/// Composition root: wires infra adapters -> data usecase -> presentation
/// bloc. Manual factory functions, no DI package — mirrors the backend's
/// `presentation/factories/make-generate-suggestions.ts`
/// (`api/CLAUDE.md` → "Architecture: ports and adapters").
SuggestionsBloc makeSuggestionsBloc() {
  final dio = buildDioClient();
  // `standardSerializers` (not the bare `serializers`) — it's the one with
  // `StandardJsonPlugin`, which serializes to/from plain JSON objects
  // matching the actual REST wire format; the bare one uses built_value's
  // internal flat-list format.
  final api = DefaultApi(dio, standardSerializers);
  final repository = SuggestionsRepositoryImpl(api);
  final getSuggestions = GetSuggestionsImpl(repository);
  return SuggestionsBloc(getSuggestions);
}
