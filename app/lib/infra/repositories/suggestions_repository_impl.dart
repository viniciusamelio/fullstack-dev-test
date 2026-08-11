import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';
import 'package:smash_app/domain/failures/suggestions_failure.dart';
import 'package:smash_app/domain/models/suggestion_request.dart';
import 'package:smash_app/domain/models/suggestion_result.dart';
import 'package:smash_app/domain/repositories/suggestions_repository.dart';
import 'package:suggestions_api_client/suggestions_api_client.dart';

/// Implements the domain's [SuggestionsRepository] against the OpenAPI-
/// generated `DefaultApi`. The only place in the app that knows about
/// `DioException`/the generated DTOs — everything above this boundary
/// (data, presentation) only ever sees [SuggestionsFailure] and domain
/// models. Mirrors the backend's `infra/llm`/`infra/db` adapters
/// implementing `data/protocols`.
class SuggestionsRepositoryImpl implements SuggestionsRepository {
  const SuggestionsRepositoryImpl(this._api);

  final DefaultApi _api;

  @override
  TaskEither<SuggestionsFailure, SuggestionResult> getSuggestions(
    SuggestionRequest request,
  ) {
    return TaskEither<SuggestionsFailure, Generate200Response>.tryCatch(
      () async {
        final response = await _api.generate(
          generateRequest: GenerateRequest(
            (b) => b
              ..occasion = GenerateRequestOccasionEnum.valueOf(
                request.occasion.name,
              )
              ..relationship = GenerateRequestRelationshipEnum.valueOf(
                request.relationship.name,
              ),
          ),
        );
        final data = response.data;
        if (data == null) {
          throw StateError('Backend returned a 2xx with an empty body');
        }
        return data;
      },
      (error, _) => _mapError(error),
    ).map(_toDomain);
  }

  SuggestionResult _toDomain(Generate200Response response) {
    return SuggestionResult(
      messages: response.messages.toList(),
      source: switch (response.source_.name) {
        'llm' => SuggestionSource.llm,
        'cache' => SuggestionSource.cache,
        _ => SuggestionSource.staticFallback,
      },
    );
  }

  SuggestionsFailure _mapError(Object error) {
    if (error is! DioException) {
      return UnexpectedFailure(message: error.toString());
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const TimeoutFailure();
      case DioExceptionType.connectionError:
        return const NetworkFailure();
      case DioExceptionType.badResponse:
        return _mapBadResponse(error);
      case DioExceptionType.badCertificate:
      case DioExceptionType.cancel:
      case DioExceptionType.unknown:
      case DioExceptionType.transformTimeout:
        return UnexpectedFailure(message: error.message);
    }
  }

  SuggestionsFailure _mapBadResponse(DioException error) {
    final statusCode = error.response?.statusCode;
    switch (statusCode) {
      case 400:
        return ValidationFailure(message: _extractErrorMessage(error));
      case 429:
        return RateLimitedFailure(
          retryAfterSeconds: int.tryParse(
            error.response?.headers.value('retry-after') ?? '',
          ),
        );
      default:
        if (statusCode != null && statusCode >= 500) {
          return ServerFailure(statusCode: statusCode);
        }
        return UnexpectedFailure(message: _extractErrorMessage(error));
    }
  }

  String? _extractErrorMessage(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['error'] is String) {
      return data['error'] as String;
    }
    return error.message;
  }
}
